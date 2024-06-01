"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Zklogin } from "@/app/utils/Zklogin";
import { CgProfile } from "react-icons/cg";
import { IoIosLogOut } from "react-icons/io";
import Image from "next/image";

/**
 *
 * @returns Navbar of landing page
 */
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [userSubId, setUserSubId] = useState<string | undefined>();
  const [userAddress, setUserAddress] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let value = localStorage.getItem("loggedIn");
      if (value !== null) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    }
  }, []);

  const loginButtonRef = useRef<HTMLButtonElement>();
  const logoutButtonRef = useRef<HTMLButtonElement>();

  const handleLoginButtonClick = async () => {
    loginButtonRef.current?.click();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogoutButtonClick = () => {
    logoutButtonRef.current?.click();
  };

  return (
    <div
      className="px-6 py-4 shadow-sm flex justify-between items-center"
      style={{ background: "#FFFCF9" }}
    >
      <div className="flex gap-2 items-center">
        <div className="text-2xl">
          <Image
            src="/logo.png"
            alt="TokenFest Logo"
            width={30}
            height={10}
            className="w-auto h-auto"
          />
        </div>
        <div className="text-black text-2xl font-semibold hover:text-gray-800 ">
          <Link href="/">Voyager</Link>
        </div>
      </div>
      <div className="hidden md:flex gap-4 items-center text-gray-500 font-space-grotesk font-semibold">
        <Link
          href={isUserLoggedIn ? "/voyager/random_chat/new" : "/"}
          className="hover:text-gray-600"
        >
          Meet New
        </Link>
        <Link
          href={isUserLoggedIn ? "/voyager/cult" : "/"}
          className="hover:text-gray-600"
        >
          Cults
        </Link>
        <Link
          href={isUserLoggedIn ? "/voyager/raids" : "/"}
          className="hover:text-gray-600"
        >
          Raids
        </Link>
        <Link
          href={isUserLoggedIn ? "/swapusdc" : "/"}
          className="hover:text-gray-600"
        >
          Swap USDC
        </Link>
        <div className="hidden lg:flex justify-center items-center gap-2">
          {isUserLoggedIn ? (
            <div className="flex">
              <Link
                href={{
                  pathname: "/voyager/profile",
                  query: {
                    userNo: userSubId,
                    userAddress: userAddress,
                  },
                }}
              >
                <CgProfile className="text-4xl cursor-pointer hover:text-gray-600" />
              </Link>
              <IoIosLogOut
                className="ml-2 text-3xl cursor-pointer hover:text-gray-600"
                onClick={handleLogoutButtonClick}
              />
            </div>
          ) : (
            <button
              className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-2 px-6 rounded-full"
              onClick={handleLoginButtonClick}
            >
              Log in
            </button>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-black focus:outline-none">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-16 right-0 bg-white w-full shadow-lg py-4">
          <Link
          href={isUserLoggedIn ? "/voyager/random_chat/new" : "/"}
          className="block px-4 py-2 text-black font-semibold hover:text-gray-700"
        >
          Meet New
        </Link>
        <Link
          href={isUserLoggedIn ? "/voyager/cult" : "/"}
          className="block px-4 py-2 text-black font-semibold hover:text-gray-700"

        >
          Cults
        </Link>
        <Link
          href={isUserLoggedIn ? "/voyager/raids" : "/"}
          className="block px-4 py-2 text-black font-semibold hover:text-gray-700"
        >
          Raids
        </Link>
        <Link
          href={isUserLoggedIn ? "/swapusdc" : "/"}
          className="block px-4 py-2 text-black font-semibold hover:text-gray-700"
        >
          Swap USDC
        </Link>
          {isUserLoggedIn ? (
            <div className="flex">
              <Link
                href={{
                  pathname: "/voyager/profile",
                  query: {
                    userNo: userSubId,
                    userAddress: userAddress,
                  },
                }}
              >
                <CgProfile className="text-4xl cursor-pointer" />
              </Link>
              <IoIosLogOut
                className="ml-2 text-3xl cursor-pointer"
                onClick={handleLogoutButtonClick}
              />
            </div>
          ) : (
            <button
              className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-2 px-6 rounded-full"
              onClick={handleLoginButtonClick}
            >
              Log in
            </button>
          )}
        </div>
      )}
      <Zklogin
        loginButtonRef={loginButtonRef}
        logoutButtonRef={logoutButtonRef}
        setIsUserLoggedIn={setIsUserLoggedIn}
        setUserSubId={setUserSubId}
        setUserAddress={setUserAddress}
      />
    </div>
  );
};

export default Navbar;
