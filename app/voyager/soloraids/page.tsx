"use client"
import Footer from '@/app/components/reusable/Footer'
import Navbar from '@/app/components/reusable/HomeNavbar'
import Dropdown from '@/app/utils/dropdown'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from "next/navigation";

import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import {
    SerializedSignature,
    decodeSuiPrivateKey,
} from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
    genAddressSeed,
    generateNonce,
    generateRandomness,
    getExtendedEphemeralPublicKey,
    getZkLoginSignature,
    jwtToAddress,
} from "@mysten/zklogin";
import {
    NetworkName,
    makeExplorerUrl,
    requestSuiFromFaucet,
    shortenSuiAddress,
} from "@polymedia/suits";
import { Modal } from "@polymedia/webutils";
import { jwtDecode } from "jwt-decode";
import { useRef, Dispatch, SetStateAction } from "react";
import { enqueueSnackbar } from 'notistack';

const google = process.env.NEXT_PUBLIC_GOOGLE;
const salt = process.env.NEXT_PUBLIC_URL_SALT_SERVICE;
const zk = process.env.NEXT_PUBLIC_URL_ZK_PROVER;

const NETWORK: NetworkName = "devnet";
const MAX_EPOCH = 2; // keep ephemeral keys active for this many Sui epochs from now (1 epoch ~= 24h)

const suiClient = new SuiClient({
    url: getFullnodeUrl(NETWORK),
});

/* Session storage keys */

const setupDataKey = "zklogin-demo.setup";
const accountDataKey = "zklogin-demo.accounts";

type OpenIdProvider = "Google" | "Twitch" | "Facebook";

type SetupData = {
    provider: OpenIdProvider;
    maxEpoch: number;
    randomness: string;
    ephemeralPrivateKey: string;
};

export type AccountData = {
    provider: OpenIdProvider;
    userAddr: string;
    zkProofs: any;
    ephemeralPrivateKey: string;
    userSalt: string;
    sub: string;
    aud: string;
    maxEpoch: number;
};
const SoloRaids = () => {
    const searchParams = useSearchParams();
    const title = searchParams.get("title");

    const accounts = useRef<AccountData[]>(loadAccounts()); // useRef() instead of useState() because of setInterval()
    const [balances, setBalances] = useState<Map<string, number>>(new Map()); // Map<Sui address, SUI balance>
    const [modalContent, setModalContent] = useState<string>("");
    const [IsUserLoggedIn, setIsUserLoggedIn] = useState(Boolean);
    const [userAddress, setUserAddress] = useState("");

    const IP_ADDRESS = process.env.NEXT_PUBLIC_SERVER_IP_ADDRESS;
    const router = useRouter();
    useEffect(() => {
        (async function () {
            await completeZkLogin();
            const userData = accounts.current[0];
            if (userData) {
                setUserAddress(userData.userAddr);
                let getUserData;
                getUserData = await fetch(
                    `http://${IP_ADDRESS}/v1.0/voyager/user/sub-id/${userData.sub}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                "Network response was not ok " + response.statusText
                            );
                        }
                        return response.json();
                    })
                    .then((data) => {
                        return data;
                    })
                    .catch((error) => {
                        return undefined;
                    });

                if (getUserData === undefined) {
                    const newUserData = {
                        id: uuidv4(),
                        user_address: userData.userAddr,
                        sub_id: userData.sub,
                        name: "",
                        provider: userData,
                    };
                    fetch(`http://${IP_ADDRESS}/v1.0/voyager/user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newUserData),
                    })
                        .then((response) => response.json())
                        .then((data) => console.log(data))
                        .catch((error) => console.error("Error:", error));
                }
            }
        })();
        fetchBalances(accounts.current);
        const interval = setInterval(() => fetchBalances(accounts.current), 5_000);
        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line
    }, []);

    /* zkLogin end-to-end */

    /**
     * Start the zkLogin process by getting a JWT token from an OpenID provider.
     * https://docs.sui.io/concepts/cryptography/zklogin#get-jwt-token
     */
    async function beginZkLogin(provider: OpenIdProvider) {
        setModalContent(`🔑 Logging in with ${provider}...`);

        // Create a nonce
        const { epoch } = await suiClient.getLatestSuiSystemState();
        const maxEpoch = Number(epoch) + MAX_EPOCH; // the ephemeral key will be valid for MAX_EPOCH from now
        const ephemeralKeyPair = new Ed25519Keypair();
        const randomness = generateRandomness();
        const nonce = generateNonce(
            ephemeralKeyPair.getPublicKey(),
            maxEpoch,
            randomness
        );

        // Save data to session storage so completeZkLogin() can use it after the redirect
        saveSetupData({
            provider,
            maxEpoch,
            randomness: randomness.toString(),
            ephemeralPrivateKey: ephemeralKeyPair.getSecretKey(),
        });

        // Start the OAuth flow with the OpenID provider
        const urlParamsBase = {
            nonce: nonce,
            redirect_uri: window.location.origin,
            response_type: "id_token",
            scope: "openid",
        };
        let loginUrl = "";
        switch (provider) {
            case "Google": {
                const urlParams = new URLSearchParams({
                    ...urlParamsBase,
                    client_id: google!,
                });
                loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`;
                break;
            }
        }
        window.location.replace(loginUrl);
    }

    /**
     * Complete the zkLogin process.
     * It sends the JWT to the salt server to get a salt, then
     * it derives the user address from the JWT and the salt, and finally
     * it gets a zero-knowledge proof from the Mysten Labs proving service.
     */
    async function completeZkLogin() {
        // === Grab and decode the JWT that beginZkLogin() produced ===
        // https://docs.sui.io/concepts/cryptography/zklogin#decoding-jwt

        // grab the JWT from the URL fragment (the '#...')
        const urlFragment = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(urlFragment);
        const jwt = urlParams.get("id_token");
        if (!jwt) {
            return;
        }

        // remove the URL fragment
        window.history.replaceState(null, "", window.location.pathname);

        // decode the JWT
        const jwtPayload = jwtDecode(jwt);
        if (!jwtPayload.sub || !jwtPayload.aud) {
            console.warn("[completeZkLogin] missing jwt.sub or jwt.aud");
            return;
        }

        // === Get the salt ===
        // https://docs.sui.io/concepts/cryptography/zklogin#user-salt-management

        const requestOptions =
            salt === "/dummy-salt-service.json"
                ? // dev, using a JSON file (same salt all the time)
                {
                    method: "GET",
                }
                : // prod, using an actual salt server
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jwt }),
                };

        const saltResponse: { salt: string } | null = await fetch(
            salt!,
            requestOptions
        )
            .then((res) => {
                console.debug("[completeZkLogin] salt service success");
                return res.json();
            })
            .catch((error: unknown) => {
                console.warn("[completeZkLogin] salt service error:", error);
                return null;
            });

        if (!saltResponse) {
            return;
        }

        const userSalt = BigInt(saltResponse.salt);

        // === Get a Sui address for the user ===
        // https://docs.sui.io/concepts/cryptography/zklogin#get-the-users-sui-address

        const userAddr = jwtToAddress(jwt, userSalt);

        // === Load and clear the data which beginZkLogin() created before the redirect ===
        const setupData = loadSetupData();
        if (!setupData) {
            console.warn("[completeZkLogin] missing session storage data");
            return;
        }
        clearSetupData();
        for (const account of accounts.current) {
            if (userAddr === account.userAddr) {
                console.warn(
                    `[completeZkLogin] already logged in with this ${setupData.provider} account`
                );
                return;
            }
        }

        // === Get the zero-knowledge proof ===
        // https://docs.sui.io/concepts/cryptography/zklogin#get-the-zero-knowledge-proof

        const ephemeralKeyPair = keypairFromSecretKey(
            setupData.ephemeralPrivateKey
        );
        const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
        const payload = JSON.stringify(
            {
                maxEpoch: setupData.maxEpoch,
                jwtRandomness: setupData.randomness,
                extendedEphemeralPublicKey:
                    getExtendedEphemeralPublicKey(ephemeralPublicKey),
                jwt,
                salt: userSalt.toString(),
                keyClaimName: "sub",
            },
            null,
            2
        );

        console.debug("[completeZkLogin] Requesting ZK proof with:", payload);
        setModalContent("⏳ Requesting ZK proof. This can take a few seconds...");

        const zkProofs = await fetch(zk!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
        })
            .then((res) => {
                console.debug("[completeZkLogin] ZK proving service success");
                return res.json();
            })
            .catch((error: unknown) => {
                console.warn("[completeZkLogin] ZK proving service error:", error);
                return null;
            })
            .finally(() => {
                setModalContent("");
            });

        if (!zkProofs) {
            return;
        }

        // === Save data to session storage so sendTransaction() can use it ===
        saveAccount({
            provider: setupData.provider,
            userAddr,
            zkProofs,
            ephemeralPrivateKey: setupData.ephemeralPrivateKey,
            userSalt: userSalt.toString(),
            sub: jwtPayload.sub,
            aud:
                typeof jwtPayload.aud === "string" ? jwtPayload.aud : jwtPayload.aud[0],
            maxEpoch: setupData.maxEpoch,
        });
        setIsUserLoggedIn(true);
        if (typeof window !== "undefined") localStorage.setItem("loggedIn", "true");
    }

    /**
     * Assemble a zkLogin signature and submit a transaction
     * https://docs.sui.io/concepts/cryptography/zklogin#assemble-the-zklogin-signature-and-submit-the-transaction
     */
    // const handleJoinClick = async (account: AccountData) => {
    //   await sendTransaction(account, () => {
    //     router.push("/voyager/communities"); // Navigate to the success page
    //   });
    // };
    async function sendTransaction(account: AccountData) {
        setModalContent("🚀 Sending transaction...");
        console.log("[sendTransaction] Starting transaction");

        // Sign the transaction bytes with the ephemeral private key
        const txb = new TransactionBlock();
    const mintCoin = txb.splitCoins(txb.gas, [txb.pure("1000000000")]);
    const packageObjectId =
      "0xbbacf675ec2e1af9aea4c7902ac8762d8ce080f3b69ee5d9a40ca1046dc29e1e";
    txb.moveCall({
      target: `${packageObjectId}::mynft::stake`,
      arguments: [
        mintCoin, 
        txb.pure("0x77e7315c2596780aa90a0485d6be17be85cbcc28421df59b91ae654b428c7999"),
      ],
    });
    txb.setSender(account.userAddr);
    console.log("[sendTransaction] Account address:", account.userAddr);

        const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
        const { bytes, signature: userSignature } = await txb.sign({
            client: suiClient,
            signer: ephemeralKeyPair,
        });

        console.log("[sendTransaction] Transaction signed:", {
            bytes,
            userSignature,
        });
        
        // Generate an address seed by combining userSalt, sub (subject ID), and aud (audience)
        const addressSeed = genAddressSeed(
            BigInt(account.userSalt),
            "sub",
            account.sub,
            account.aud
        ).toString();

        console.log("[sendTransaction] Address seed generated:", addressSeed);

        // Serialize the zkLogin signature by combining the ZK proof (inputs), the maxEpoch,
        // and the ephemeral signature (userSignature)
        const zkLoginSignature: SerializedSignature = getZkLoginSignature({
            inputs: {
                ...account.zkProofs,
                addressSeed,
            },
            maxEpoch: account.maxEpoch,
            userSignature,
        });

        console.log(
            "[sendTransaction] ZK Login signature created:",
            zkLoginSignature
        );
        
        // Execute the transaction
        await suiClient
            .executeTransactionBlock({
                transactionBlock: bytes,
                signature: zkLoginSignature,
                options: {
                    showEffects: true,
                },
            })
            .then((result) => {
                console.debug(
                    "[sendTransaction] executeTransactionBlock response:",
                    result
                );
                fetchBalances([account]);
                window.alert("Stake Success");
                //   if (callback) {
                //     callback(); // Navigate to the success page
                //   }
             
                
            })
            .catch((error: unknown) => {
                console.warn(
                    "[sendTransaction] executeTransactionBlock failed:",
                    error
                );
                return null;
            })
            .finally(() => {
                setModalContent("");
            });
    }

    /**
     * Create a keypair from a base64-encoded secret key
     */
    function keypairFromSecretKey(privateKeyBase64: string): Ed25519Keypair {
        const keyPair = decodeSuiPrivateKey(privateKeyBase64);
        return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
    }

    /**
     * Get the SUI balance for each account
     */
    async function fetchBalances(accounts: AccountData[]) {
        if (accounts.length == 0) {
            return;
        }
        const newBalances = new Map<string, number>();
        for (const account of accounts) {
            const suiBalance = await suiClient.getBalance({
                owner: account.userAddr,
                coinType: "0x2::sui::SUI",
            });
            newBalances.set(
                account.userAddr,
                +suiBalance.totalBalance / 1_000_000_000
            );
        }
        // setBalances((prevBalances) => new Map([...prevBalances, ...newBalances]));
    }
    const queryevents = async () => {
        let cursor = null;
        let hasNextPage = false;
        let allParsedJsonData: any[] = [];

        do {
            const res: any = await suiClient.queryEvents({
                query: {
                    MoveModule: {
                        module: `mynft`,
                        package:
                            "0xbbacf675ec2e1af9aea4c7902ac8762d8ce080f3b69ee5d9a40ca1046dc29e1e",
                    },
                },
                limit: 50,
                order: "ascending",
                cursor,
            });

            cursor = res.nextCursor;
            hasNextPage = res.hasNextPage;

            console.log(
                res.data.length,
                res.data.map((d: any) => d.parsedJson),
                res.nextCursor,
                res.hasNextPage
            );

            allParsedJsonData = allParsedJsonData.concat(
                res.data.map((d: any) => d.parsedJson)
            );
        } while (hasNextPage);

        // Log the absolute last parsedJson data entry
        const lastParsedJson =
            allParsedJsonData.length > 0
                ? allParsedJsonData[allParsedJsonData.length - 1]
                : null;
        console.log(lastParsedJson);
    };

    /* Session storage */

    function saveSetupData(data: SetupData) {
        if (typeof window !== "undefined") {
            localStorage.setItem(setupDataKey, JSON.stringify(data));
        }
    }

    function loadSetupData(): SetupData | null {
        if (typeof window !== "undefined") {
            const dataRaw = localStorage.getItem(setupDataKey);
            if (!dataRaw) {
                return null;
            }
            const data: SetupData = JSON.parse(dataRaw);
            return data;
        }
        return null;
    }

    function clearSetupData(): void {
        if (typeof window !== "undefined") localStorage.removeItem(setupDataKey);
    }

    function saveAccount(account: AccountData): void {
        const newAccounts = [account, ...accounts.current];
        if (typeof window !== "undefined") {
            localStorage.setItem(accountDataKey, JSON.stringify(newAccounts));
        }
        accounts.current = newAccounts;
        fetchBalances([account]);
    }

    function loadAccounts(): AccountData[] {
        if (typeof window !== "undefined") {
            const dataRaw = localStorage.getItem(accountDataKey);
            if (!dataRaw) {
                return [];
            }
            const data: AccountData[] = JSON.parse(dataRaw);
            return data;
        }
        return [];
    }

    function clearState(): void {
        setIsUserLoggedIn(false);
        if (typeof window !== "undefined") {
            localStorage.removeItem("loggedIn");
            localStorage.clear();
        }
        accounts.current = [];
        setBalances(new Map());
    }

    return (
        <div>
            <Navbar />
            <div className="flex min-h-screen">
                <aside className="bg-[#75E2FF] w-80 p-12">
                    <div className="mb-6 bg-white p-4 rounded-2xl">
                        <img src="/calendar.jpg" className='rounded-full w-[20%]' />
                        <a href="/voyager/createEvent"><button className="w-[80%] bg-black text-white py-2 rounded mt-6">+ Create a Raid</button></a>
                    </div>
                    <div className="mb-6 bg-white p-4 rounded-2xl">
                        <img src="/calendar.jpg" className='rounded-full w-[20%]' />
                        <a href="/voyager/profile"><h2 className="text-lg mb-2 mt-8"><span className="text-4xl float-right">↗</span>Solo raid I am Attending </h2></a>
                    </div>
                    <div className="mb-6 bg-white p-2 rounded-2xl">
                        <h2 className="text-lg mb-2"><Dropdown /></h2>
                    </div>
                </aside>
                <main className="bg-[#D7E58D] flex-grow p-8">
                    <div className="flex items-center justify-between mb-8">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-[50%] px-4 py-2 border border-gray-300 rounded-full focus:outline-none"
                        />
                          
                        <div>
                        {accounts.current.map((acct) => (
                            <button className='p-2 px-4 bg-black rounded-full text-white' key={acct.userAddr} onClick={() => sendTransaction(acct)}>Stake Now</button>
                        ))}
                        </div>
                         
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {title &&
                            <div className="bg-white p-4">
                                <img src="/goa.png" className="w-80 h-90 object-cover rounded-lg mb-4" />
                                <h3 className="text-3xl mb-2">{title}</h3>
                                <p className="text-gray-700 mb-4">No Of Ticket Available: 5 </p>
                                <a href="/voyager/solomint"> <button className="w-[50%] bg-black text-white py-2 rounded">Join now</button></a>
                            </div>
                        }
                        <div className="bg-white p-4">
                            <img src="/solo1.png" className="w-80 h-90 object-cover rounded-lg mb-4" />
                            <h3 className="text-3xl mb-2">Trip to Bali</h3>
                            <p className="text-gray-700 mb-4">No Of Ticket Available: 3</p>
                            <a href="/voyager/solomint"><button className="w-[50%] bg-black text-white py-2 rounded">Join now</button></a>
                        </div>
                        <div className="bg-white p-4">
                            <img src="/solo2.png" className="w-80 h-90 object-cover rounded-lg mb-4" />
                            <h3 className="text-3xl  mb-2">Trip to USA</h3>
                            <p className="text-gray-700 mb-4">No Of Ticket Available: 4</p>
                            <a href="/voyager/solomint"><button className="w-[50%] bg-black text-white py-2 rounded">Join now</button></a>
                        </div>
                        <div className="bg-white p-4">
                            <img src="/solo3.png" className="w-80 h-90 object-cover rounded-lg mb-4" />
                            <h3 className="text-3xl mb-2">Trip to Manali</h3>
                            <p className="text-gray-700 mb-4">No Of Ticket Available: 2</p>
                            <a href="/voyager/solomint"> <button className="w-[50%] bg-black text-white py-2 rounded">Join now</button></a>
                        </div>
                       

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default SoloRaids

function uuidv4() {
    throw new Error('Function not implemented.')
}
