"use client";

import React, { useState } from "react";
import ProfileNavbar from "../../components/profile_components/ProfileNavbar";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { PROFILE_PAGE_IMAGES } from "../../utils/constants";
import Footer from "@/app/components/reusable/Footer";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const Profile = () => {
  const [isProfileLiked, setIsProfileLiked] = useState(false);

  return (
    <main className="w-[95vw] mx-auto p-10">
      <ProfileNavbar />
      <hr className="mt-5" />
      <div className="row-1 flex flex-wrap items-center gap-5 justify-center mt-5">
        <div className="h-[212px] w-[212px]">
          <Image
            src="https://img.freepik.com/free-photo/businesswoman-working-with-modern-virtual-technologies-hands-touching-screen_1212-720.jpg?t=st=1715435128~exp=1715438728~hmac=ae3b6f2ce406abb053c3451fa5abbbefc7e0806ce62e0563a22a4368f1ddc6f0&w=212"
            height={212}
            width={212}
            alt="profile-picture"
            className="rounded-full contain h-[100%]"
          />
        </div>
        <div className="ml-8">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">VoyagerConnect</h3>
            {isProfileLiked ? (
              <FaHeart className="ml-8 text-[#EE4E4E] text-xl" />
            ) : (
              <FaRegHeart
                className="ml-8 text-xl"
                onClick={() => setIsProfileLiked(true)}
              />
            )}
          </div>
          <div className="font-medium text-md text-[#5d5d5b]">
            Virtual world explorer
          </div>
          <div className="flex gap-3 mt-5">
            <div className="">
              <span className="font-medium text-md mr-2">45</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Achievement
              </span>
            </div>
            <div>
              <span className="font-medium text-md mr-2">Co</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Communities
              </span>
            </div>
            <div>
              <span className="font-medium text-md mr-2">Int</span>
              <span className="font-medium text-md text-[#5d5d5b]">
                Discoveries
              </span>
            </div>
          </div>
          <div className="flex gap-5 mt-8">
            <button className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white font-bold py-1 px-14 rounded">
              Join
            </button>
            <button className="bg-[#EAECF0] font-bold py-1 px-14 rounded hover:shadow-md">
              Chat
            </button>
          </div>
        </div>
      </div>
      <div className="row-2 flex justify-center gap-10 mt-14">
        <span className="font-bold text-md text-[#5d5d5b]">My Journey</span>
        <span className="font-bold text-md text-[#5d5d5b]">Cults</span>
        <span className="font-bold text-md text-[#5d5d5b]">Poaps</span>
      </div>
      <hr className="mt-5" />
      <div className="images-row flex flex-wrap gap-5 justify-around mt-6">
        {PROFILE_PAGE_IMAGES.map((data) => (
          <Image
            key={uuidv4()}
            src={data.src}
            height={272}
            width={356}
            alt="posts"
            className="object-fill"
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

export default Profile;
