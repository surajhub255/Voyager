"use client";

import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import SearchBar from "../reusable/SearchBar";
import { COMMUNITY_NAVBAR_LINKS } from "@/app/utils/constants";

const Navbar = () => {
  return (
    <div className="flex justify-between mt-2 mb-8">
      <SearchBar placeholder="Find new friends, chat and discover communities"/>
      <div className="flex">
        <div className="flex gap-10">
          {COMMUNITY_NAVBAR_LINKS.map(({ label, link }) => (
            <Link
              key={uuidv4()}
              href={link}
              className="font-medium self-center"
            >
              {label}
            </Link>
          ))}
        </div>
        <button className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-2 px-6 rounded ml-10">
          Sign in
        </button>
      </div>
    </div>
  );
};

export default Navbar;
