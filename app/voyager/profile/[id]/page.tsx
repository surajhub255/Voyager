"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ProfileNavbar from "../../../components/profile_components/ProfileNavbar";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import {
  PROFILE_PAGE_MY_JOURNEY_CARDS,
  PROFILE_PAGE_CULT_CARDS,
  PROFILE_PAGE_POAPS_CARDS,
} from "../../../utils/constants";
import Footer from "@/app/components/reusable/Footer";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import TabsCards from "@/app/components/profile_components/TabsCards";
import Link from "next/link";
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
import { NetworkName } from "@polymedia/suits";
import { jwtDecode } from "jwt-decode";
interface UserData {
  id: string;
  user_address: string;
  sub_id: string;
  name: string;
  provider: string;
  gender: string;
  interest: string;
  location: string;
}

type OpenIdProvider = "Google" | "Twitch" | "Facebook";

type SetupData = {
  provider: OpenIdProvider;
  maxEpoch: number;
  randomness: string;
  ephemeralPrivateKey: string;
};

type AccountData = {
  provider: OpenIdProvider;
  userAddr: string;
  zkProofs: any;
  ephemeralPrivateKey: string;
  userSalt: string;
  sub: string;
  aud: string;
  maxEpoch: number;
};

const google = process.env.NEXT_PUBLIC_GOOGLE;
const salt = process.env.NEXT_PUBLIC_URL_SALT_SERVICE;
const zk = process.env.NEXT_PUBLIC_URL_ZK_PROVER;

const NETWORK: NetworkName = "devnet";
const MAX_EPOCH = 2; // keep ephemeral keys active for this many Sui epochs from now (1 epoch ~= 24h)

const setupDataKey = "zklogin-demo.setup";
const accountDataKey = "zklogin-demo.accounts";

const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

const FriendProfile = () => {
  const [isProfileLiked, setIsProfileLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("Cults");
  const [userData, setUserData] = useState<UserData>();

  const accounts = useRef<AccountData[]>(loadAccounts());

  const IP_ADDRESS = process.env.NEXT_PUBLIC_SERVER_IP_ADDRESS;

  const params = useParams();

  useEffect(() => {
    let getUserData;
    (async function () {
      // send a get request to get data of user saved in db.
      getUserData = await fetch(
        `https://${IP_ADDRESS}/v1.0/voyager/user/${params.id}`,
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
      setUserData(getUserData);
    })();
    // eslint-disable-next-line
  }, [userData]);

  // for zk login

  useEffect(() => {
    (async function () {
      await completeZkLogin();
    })();
    fetchBalances(accounts.current);
    const interval = setInterval(() => fetchBalances(accounts.current), 5_000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, []);

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
        // you can set here modal content
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
    if (typeof window !== "undefined") localStorage.setItem("loggedIn", "true");
  }

  /**
   * Assemble a zkLogin signature and submit a transaction
   * https://docs.sui.io/concepts/cryptography/zklogin#assemble-the-zklogin-signature-and-submit-the-transaction
   */
  let heartCount = 0;
  async function sendTransaction(account: AccountData) {
    setIsProfileLiked(true);
    // Sign the transaction bytes with the ephemeral private key
    const txb = new TransactionBlock();
    const packageObjectId =
      "0x4837d0a64ebd11f83ce43748d98e6f7b9bb3a50998ae05a8da9541406b343802";
    txb.moveCall({
      target: `${packageObjectId}::voyagerprofile::update_hearts`,
      arguments: [
        txb.pure(
          "0xebfad0fc2267231aae45766f960f0c899d1a87ee5ae31495a9270200766f3e0a"
        ),
        txb.pure(heartCount + 1),
      ],
    });
    txb.setSender(account.userAddr);
    console.log("like");

    const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
    const { bytes, signature: userSignature } = await txb.sign({
      client: suiClient,
      signer: ephemeralKeyPair,
    });

    // Generate an address seed by combining userSalt, sub (subject ID), and aud (audience)
    const addressSeed = genAddressSeed(
      BigInt(account.userSalt),
      "sub",
      account.sub,
      account.aud
    ).toString();

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
      })
      .catch((error: unknown) => {
        console.warn(
          "[sendTransaction] executeTransactionBlock failed:",
          error
        );
        return null;
      })
      .finally(() => {
        //  you can set here modal content
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

  return (
    <main className="w-[95vw] mx-auto p-10">
      <ProfileNavbar />
      <hr className="mt-5" />
      <div className="row-1 flex flex-wrap items-center gap-5 justify-center mt-5">
        <div className="h-[212px] w-[212px]">
          <Image
            src="https://img.freepik.com/free-photo/young-woman-with-round-glasses-yellow-sweater_273609-7091.jpg?t=st=1716449282~exp=1716452882~hmac=164428b5943ab7140be5d8cbfa15eaf12b2ff3961b720f9e86d1163628d92e9f&w=826"
            height={212}
            width={212}
            alt="profile-picture"
            className="rounded-full contain h-[100%]"
          />
        </div>
        <div className="ml-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">
                {userData !== undefined && userData.name !== ""
                  ? userData?.name
                  : "Random-User"}
              </h2>
            </div>
            {isProfileLiked ? (
              <FaHeart className="ml-8 text-[#EE4E4E] text-xl cursor-pointer" />
            ) : (
              accounts.current.map((acct) => (
                <FaRegHeart
                  key={acct.userAddr}
                  className="ml-8 text-xl cursor-pointer"
                  onClick={() => sendTransaction(acct)}
                />
              ))
            )}
          </div>
          <div className="font-medium text-[#5d5d5b]">
            Virtual world explorer
          </div>
          <div className="flex flex-wrap gap-5 mt-3">
            {/* <span className="text-sm font-semibold text-[#343433]">
              Interest: {userData?.interest}
            </span> */}
            {/* <span className="text-sm font-semibold text-[#343433]">
              Age:&nbsp;
              {userData !== undefined && userData.name !== ""
                ? userData?.age
                : "00"}
            </span> */}
            <span className="text-sm font-semibold text-[#343433]">
              Gender:&nbsp;
              {userData !== undefined && userData.name !== ""
                ? userData?.gender
                : "other"}
            </span>
          </div>
          <div className="flex gap-3 mt-5">
            <div>
              <span className="font-medium text-md mr-2">25</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Achievement
              </span>
            </div>
            <div>
              <span className="font-medium text-md mr-2">3</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Communities
              </span>
            </div>
            <div>
              <span className="font-medium text-md mr-2">4</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Discoveries
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="row-2 flex justify-center gap-10 mt-14">
        <Link
          href="#"
          className={`font-bold text-md text-[#5d5d5b] ${
            activeTab === "My Journey" && "underline underline-offset-4"
          }`}
          onClick={() => setActiveTab("My Journey")}
        >
          My Journey
        </Link>
        <Link
          href="#"
          className={`font-bold text-md text-[#5d5d5b] ${
            activeTab === "Cults" && "underline underline-offset-4"
          }`}
          onClick={() => setActiveTab("Cults")}
        >
          Cults
        </Link>
        <Link
          href="#"
          className={`font-bold text-md text-[#5d5d5b] ${
            activeTab === "Poaps" && "underline underline-offset-4"
          }`}
          onClick={() => setActiveTab("Poaps")}
        >
          Poaps
        </Link>
      </div>
      <hr className="mt-5" />
      <div className="flex flex-wrap gap-x-8 gap-y-8 justify-center mt-10">
        {activeTab === "My Journey" &&
          PROFILE_PAGE_MY_JOURNEY_CARDS.map((cardData) => (
            <TabsCards
              key={uuidv4()}
              name={cardData.name}
              imgSrc={cardData.src}
            />
          ))}
        {activeTab === "Cults" &&
          PROFILE_PAGE_CULT_CARDS.map((cardData) => (
            <TabsCards
              key={uuidv4()}
              name={cardData.name}
              imgSrc={cardData.src}
            />
          ))}
        {activeTab === "Poaps" &&
          PROFILE_PAGE_POAPS_CARDS.map((cardData) => (
            <TabsCards
              key={uuidv4()}
              name={cardData.name}
              imgSrc={cardData.src}
            />
          ))}
      </div>
      <div className="flex justify-center mt-14 mb-12">
        <button className="bg-[#EAECF0] font-semibold py-2 px-4 rounded hover:shadow-md">
          Discover More
        </button>
      </div>
      <hr className="mt-5" />
      <Footer />
    </main>
  );
};

export default FriendProfile;
