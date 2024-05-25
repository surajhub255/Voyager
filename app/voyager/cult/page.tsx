"use client";

import HomeNavbar from '@/app/components/reusable/HomeNavbar';
import React from 'react'
import Image from "next/image";
import 'tailwindcss/tailwind.css';
import { CULT_PAGE_COMMUNITIES_IMAGE } from '@/app/utils/constants';
import { v4 as uuidv4 } from "uuid";
import Footer from '@/app/components/reusable/Footer';

import { useRouter } from 'next/navigation';
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
import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";


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

interface Props {
    loginButtonRef: any;
    logoutButtonRef: any;
    setIsUserLoggedIn: Dispatch<SetStateAction<boolean>>;
    setUserAddress: Dispatch<SetStateAction<string | undefined>>;
}

const Cult = ({
    loginButtonRef,
    logoutButtonRef,
    setIsUserLoggedIn,
    setUserAddress,
}: Props) => {
    const accounts = useRef<AccountData[]>(loadAccounts()); // useRef() instead of useState() because of setInterval()
    const [balances, setBalances] = useState<Map<string, number>>(new Map()); // Map<Sui address, SUI balance>
    const [modalContent, setModalContent] = useState<string>("");

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
    const handleJoinClick = async (account: AccountData) => {
        await sendTransaction(account, () => {
            router.push('/voyager/communities');  // Navigate to the success page
        });
    };
    async function sendTransaction(account: AccountData, callback: () => void) {
        setModalContent("🚀 Sending transaction...");
        console.log('[sendTransaction] Starting transaction');
        
        // Sign the transaction bytes with the ephemeral private key
        const txb = new TransactionBlock();
        const packageObjectId = "0x9482fa9a6e52c72b196834d4134338e2f609c858b07a497a0e00a648d975fe1a";
        txb.moveCall({
            target: `${packageObjectId}::mynft::mint`,
            arguments: [
                txb.pure("mygame"),        // Name argument
                txb.pure("bvklb odjfoiv askhjvlk"),
                txb.pure("bvklb odjfoiv askhjvlk"), // Description argument
            ],
        });
        txb.setSender(account.userAddr);
        console.log('[sendTransaction] Account address:', account.userAddr);
    
        const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
        const { bytes, signature: userSignature } = await txb.sign({
            client: suiClient,
            signer: ephemeralKeyPair,
        });
    
        console.log('[sendTransaction] Transaction signed:', { bytes, userSignature });
        
        // Generate an address seed by combining userSalt, sub (subject ID), and aud (audience)
        const addressSeed = genAddressSeed(
            BigInt(account.userSalt),
            "sub",
            account.sub,
            account.aud
        ).toString();
    
        console.log('[sendTransaction] Address seed generated:', addressSeed);
        
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
    
        console.log('[sendTransaction] ZK Login signature created:', zkLoginSignature);
    
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
                if (callback) {
                    callback();  // Navigate to the success page
                }
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
                        package: '0x9482fa9a6e52c72b196834d4134338e2f609c858b07a497a0e00a648d975fe1a',
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
                res.hasNextPage,
            );

            allParsedJsonData = allParsedJsonData.concat(res.data.map((d: any) => d.parsedJson));

        } while (hasNextPage);

        // Log the absolute last parsedJson data entry
        const lastParsedJson = allParsedJsonData.length > 0 ? allParsedJsonData[allParsedJsonData.length - 1] : null;
        console.log(lastParsedJson);
    }

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
    const images = [
        { src: '/c2.png', alt: 'Anime Image 1' },
        { src: '/c3.png', alt: 'Anime Image 2' },
    ];
    return (

        <main className="w-[full] mx-auto bg-[#FFFCF9] ">
            <div className="mx-20">
                <HomeNavbar />
            </div>
            <div className="bg-[#FFFCF9] ">
                <div className="flex lg:flex-row md:flex-col sm:items-center xs:flex-col justify-between row-1 mx-20">
                    <div className="flex flex-col xs:items-center lg:items-start">
                        <h1 className=" text-7xl mt-40 md:w-[76.52%] sm:w-[100%] font-englebert">
                            Discover the Power of
                        </h1>
                        <div className="mt-6 text-2xl md:w-[76.52%] sm:w-[100%] font-space-grotesk text-gray-500">Unlock the Anime-Inspired Community Experience: Explore our vibrant network, connect with like-minded individuals, and embark on a journey of shared passions and lively interactions</div>
                        <button className="bg-[#101521] hover:bg-[#2a73ae] text-white font-bold py-4 px-8 rounded-lg mt-10">
                            Launch your own Cult
                        </button>
                    </div>
                    <Image
                        src="/community1.png"
                        priority
                        width={700}
                        height={400}
                        alt="hero-image"
                        className="mt-10"
                    />
                </div>

                <div className="mt-24 row-2 flex flex-col text-center items-centert">
                    <div className="flex flex-col items-center text-center">
                        <div>
                            <h1 className="text-5xl font-playfair-display" style={{ fontWeight: 500, fontStyle: 'italic' }}>
                                Discover the Communities of Anime-Inspired Voyager
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center mt-20 mx-20 gap-20">
                        {CULT_PAGE_COMMUNITIES_IMAGE.map((data) => (
                            <div key={uuidv4()} className="flex justify-center flex-col mb-8 w-1/4">
                                <div className="mt-8 text-3xl font-playfair-display" style={{ fontWeight: 600, fontStyle: 'italic' }}>
                                    {data.community_interest}
                                </div>
                                <Image
                                    src={data.src}
                                    height={400}
                                    width={700}
                                    alt="vivrant-communities"
                                    className="object-fill rounded"
                                />
                                {accounts.current.map((acct) => (

                                    <div className="mt-2 text-lg font-space-grotesk text-gray-500 mr-12">
                                        <button className="bg-[#2a73ae] hover:bg-[#101521] text-white font-bold py-2 px-6 rounded-lg" key={acct.userAddr} onClick={() => handleJoinClick(acct)}>
                                            Join Now</button>
                                            {/* <button onClick={()=> queryevents()}>kdfkt</button> */}
                                    </div>
                                ))}
                                {/* {accounts.current.map((acct) => {
                                    const balance = balances.get(acct.userAddr);
                                    const explorerLink = makeExplorerUrl(
                                        NETWORK,
                                        "address",
                                        acct.userAddr
                                    );
                                    return (
                                        <div className="account" key={acct.userAddr}>
                                            <div>
                                                <label className={`provider ${acct.provider}`}>
                                                    {acct.provider}
                                                </label>
                                            </div>
                                            <div>
                                                Address:{" "}
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={explorerLink}
                                                >
                                                    {shortenSuiAddress(acct.userAddr, 6, 6, "0x", "...")}
                                                </a>
                                            </div>
                                            <div>User ID: {acct.sub}</div>
                                            <div>
                                                Balance:
                                                {typeof balance === "undefined"
                                                    ? "(loading)"
                                                    : `${balance} SUI`}
                                            </div>
                                            <button
                                                className={`btn-send ${!balance ? "disabled" : ""}`}
                                                disabled={!balance}
                                                onClick={() => {
                                                    sendTransaction(acct);
                                                }}
                                            >
                                                Send transaction
                                            </button>
                                            {balance === 0 && (
                                                <button
                                                    className="btn-faucet"
                                                    onClick={() => {
                                                        requestSuiFromFaucet(NETWORK, acct.userAddr);
                                                        setModalContent(
                                                            "💰 Requesting SUI from faucet. This will take a few seconds..."
                                                        );
                                                        setTimeout(() => {
                                                            setModalContent("");
                                                        }, 3000);
                                                    }}
                                                >
                                                    Use faucet
                                                </button>
                                            )}
                                            <hr />
                                        </div>
                                    );
                                })} */}
                            </div>
                        ))}
                    </div>
                </div>


                <div className="mx-20 p-8 mt-20">
                    <div className="">
                        <h1 className="text-6xl mb-4 font-playfair-display" style={{ fontWeight: 500, fontStyle: 'italic' }}>
                            Embrace the Anime-Inspired Community</h1>
                    </div>
                    <div className="flex flex-col gap-4 mb-8 mt-20 h-96 ">
                        {images.map((image, index) => (
                            <div key={index} className="w-96 sm:w-1/2  p-2">
                                <img src={image.src} alt={image.alt} className="w-96 h-48 rounded-lg shadow-md" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-16">
                        <div className="sm:mb-0">
                            <button className="bg-white text-black border border-gray-300 py-4 pr-44 pl-12 rounded-lg shadow-md">
                                Unlock Exclusive Benefits
                            </button>
                            <p className="text-gray-500 mt-2">Explore Community Features</p>
                        </div>
                    </div>
                    <div className="w-2/3 h-80 text-center sm:text-left ml-96 ">
                        <h2 className="text-6xl mb-2 ml-32 font-englebert">Community Highlights</h2>
                        <p className="text-gray-600 text-2xl mt-16 ml-32">
                            Experience the Vibrant Anime-Inspired Community: Discover exclusive content, engage in captivating discussions,
                            and immerse yourself in a world of shared interests and boundless creativity.
                        </p>
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    )
}

export default Cult