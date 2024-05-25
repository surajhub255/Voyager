import React from "react";
import Image from "next/image";
import CategoriesDropdown from "@/app/components/reusable/CategoriesDropdown";

const CategoriesAndGenderDetailsPopup = () => {
  return (
    <div className="absolute flex flex-col bg-white rounded p-4">
      <div className="flex justify-around">
        <Image src="/female.png" height={20} width={20} alt="profile-picture" />
        <Image src="/male.png" height={20} width={20} alt="profile-picture" />
        <Image
          src="/both_gender.png"
          height={20}
          width={20}
          alt="profile-picture"
        />
      </div>
      <CategoriesDropdown category="Interest" />
      <CategoriesDropdown category="Location" />
    </div>
  );
};

export default CategoriesAndGenderDetailsPopup;
