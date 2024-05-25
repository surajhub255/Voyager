"use client";
import { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { HOME_PAGE_NAVBAR_LINKS } from "@/app/utils/constants";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Zklogin } from "@/app/utils/Zklogin";
import { CgProfile } from "react-icons/cg";
import { IoIosLogOut } from "react-icons/io";
import 'tailwindcss/tailwind.css';

/**
 *
 * @returns Navbar of landing page
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
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

  const handleLogoutButtonClick = () => {
    logoutButtonRef.current?.click();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  return (
    // <div className="flex w-full justify-between mb-8">
    //   <div className="flex">
    //     <Link href="/" className="font-bold text-2xl mr-10">
    //       Voyager
    //     </Link>
    //     <div className="hidden lg:flex md:gap-10 lg:gap-14">
    //       {HOME_PAGE_NAVBAR_LINKS.map(({ label, link }) => (
    //         <Link
    //           key={uuidv4()}
    //           href={link}
    //           className="font-medium self-center"
    //         >
    //           {label}
    //         </Link>
    //       ))}
    //     </div>
    //   </div>
    //   <div className="hidden lg:flex justify-center items-center gap-2">
    //     {isUserLoggedIn ? (
    //       <div className="flex">
    //         <Link
    //           href={{
    //             pathname: "/voyager/my_account",
    //             query: {
    //               userAddress: userAddress,
    //             },
    //           }}
    //         >
    //           <CgProfile className="text-4xl cursor-pointer" />
    //         </Link>
    //         <IoIosLogOut
    //           className="ml-2 text-3xl cursor-pointer"
    //           onClick={handleLogoutButtonClick}
    //         />
    //       </div>
    //     ) : (
    //       <button
    //         className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-2 px-6 rounded"
    //         onClick={handleLoginButtonClick}
    //       >
    //         Log in
    //       </button>
    //     )}
    //   </div>
    //   {/* hamburger menu with list of all navlinks in medium or less screen size*/}
    //   <div className="lg:hidden">
    //     <div className="text-2xl cursor-pointer">
    //       <GiHamburgerMenu onClick={() => setIsMenuOpen(!isMenuOpen)} />
    //     </div>
    //     {isMenuOpen && (
    //       <ul className="absolute right-0 mr-3 mt-2 bg-white shadow-md p-5 rounded">
    //         <div
    //           className="absolute cursor-pointer text-slate-800 hover:text-black text-2xl font-bold right-0 mr-2"
    //           onClick={() => setIsMenuOpen(false)}
    //         >
    //           <IoMdClose />
    //         </div>
    //         <div className="mt-8">
    //           {HOME_PAGE_NAVBAR_LINKS.map(({ label, link }) => (
    //             <Link href={link} key={uuidv4()}>
    //               <li className="font-medium mb-3 mt-3 text-slate-800 hover:text-black">
    //                 {label}
    //               </li>
    //             </Link>
    //           ))}
    //         </div>
    //         {isUserLoggedIn ? (
    //           <>
    //             <Link
    //               href={{
    //                 pathname: "/voyager/my_account",
    //                 query: {
    //                   userAddress: userAddress,
    //                 },
    //               }}
    //             >
    //               <CgProfile className="text-4xl cursor-pointer" />
    //             </Link>
    //             <IoIosLogOut
    //               className="ml-2 text-3xl cursor-pointer"
    //               onClick={handleLogoutButtonClick}
    //             />
    //           </>
    //         ) : (
    //           <button
    //             className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-2 px-6 rounded"
    //             onClick={handleLoginButtonClick}
    //           >
    //             Log in
    //           </button>
    //         )}
    //       </ul>
    //     )}
    //   </div>
    //   <Zklogin
    //     loginButtonRef={loginButtonRef}
    //     logoutButtonRef={logoutButtonRef}
    //     setIsUserLoggedIn={setIsUserLoggedIn}
    //     setUserAddress={setUserAddress}
    //   />
    // </div>


    <div className="px-6 py-4 shadow-sm flex justify-between items-center"
      style={{ background: "#FFFCF9" }}>
      <div className="flex gap-2 items-center">
        <div className="text-2xl">
          <img
            src="/logo.png"
            alt="TokenFest Logo"
            width="30px"
            height="10px"
          />
        </div>
        <div className="text-black text-2xl font-semibold">
          <a href="/">Voyager</a>
        </div>
      </div>
      <div className="hidden md:flex gap-4 items-center text-gray-500 font-space-grotesk">
        <a href="/voyager/random_chat">Meet New</a>
        <a href="/voyager/cult">Cults</a>
        <div className="hidden lg:flex justify-center items-center gap-2">
          {isUserLoggedIn ? (
            <div className="flex">
              <Link
                href={{
                  pathname: "/voyager/my_account",
                  query: {
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
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-black focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-16 right-0 bg-white w-full shadow-lg py-4">
          <a href="/" className="block px-4 py-2 text-black">Home</a>
          <a href="/" className="block px-4 py-2 text-black">About</a>
          <a href="/" className="block px-4 py-2 text-black">Features</a>
          <a href="/" className="block px-4 py-2 text-black">Testimonials</a>
            {isUserLoggedIn ? (
              <div className="flex">
                <Link
                  href={{
                    pathname: "/voyager/my_account",
                    query: {
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
        setUserAddress={setUserAddress}
      />
    </div>
  );
};

export default Navbar;
