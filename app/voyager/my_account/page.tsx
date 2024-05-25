"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import HomeNavbar from "@/app/components/reusable/HomeNavbar";
import Footer from "@/app/components/reusable/Footer";
import CategoriesDropdown from "@/app/components/reusable/CategoriesDropdown";

const MyAccount = () => {
  const [gender, setGender] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const address = searchParams.get("userAddress");

  return (
    <main className="w-[95vw] mx-auto p-10">
      <HomeNavbar />
      <div
        className="p-10 bg-cover bg-center h-screen"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/grunge-watercolor-background-using-pastel-colours_1048-6530.jpg?t=st=1715490858~exp=1715494458~hmac=9ff8d1840af080b812a6bf02d4047e276657e07dfeef0c83b997d3d67889cef0&w=740')",
        }}
      >
        <div className="flex flex-col row1 items-center">
          <Image
            src="/profile-image.png"
            height={200}
            width={200}
            alt="profile-picture"
          />
          <div className="mt-2 font-bold text-xl flex items-center gap-2">
            <span>User Name</span>
            {/* to do => set gender according to choosen input [discuss] */}
            <span>
              {gender === "female" ? (
                <Image
                  src="/female.png"
                  height={20}
                  width={20}
                  alt="profile-picture"
                />
              ) : gender === "male" ? (
                <Image
                  src="/male.png"
                  height={20}
                  width={20}
                  alt="profile-picture"
                />
              ) : (
                <Image
                  src="/unknown_gender.png"
                  height={20}
                  width={20}
                  alt="profile-picture"
                />
              )}
            </span>
          </div>
        </div>
        <div className="flex mt-3 justify-center">
          <div className="flex flex-col gap-3">
            <div className="font-medium bg-white py-2 px-5 rounded-3xl">
              Address: {address}
            </div>
            <div className="font-medium bg-white py-2 px-5 rounded-3xl">
              Gender: {gender}
            </div>
            <CategoriesDropdown category="Location" />
            <CategoriesDropdown category="Interests" />
          </div>
        </div>
      </div>
      <hr className="mt-5" />
      <Footer />
    </main>
  );
};

export default MyAccount;
