import React from "react";
import SearchBar from "../reusable/SearchBar";
import { IoMdHome, IoIosNotifications } from "react-icons/io";
import { BiSolidMessageRounded } from "react-icons/bi";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="flex justify-between mt-2 mb-8">
      <SearchBar placeholder="Enter interests" />
      <div className="flex gap-10 items-center">
        <IoMdHome className="text-2xl text-[#5D5D5B]" />
        <BiSolidMessageRounded className="text-2xl text-[#5D5D5B]" />
        <IoIosNotifications className="text-2xl text-[#5D5D5B]" />
        <Image
          src="/profile-image.png"
          height={35}
          width={35}
          alt="profile-image"
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default Navbar;
