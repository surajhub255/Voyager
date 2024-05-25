"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
  imgSrc1: string;
  imgSrc2: string;
  imgSrc3: string;
  sectionHeading: string;
  sectionTagline1: string;
  sectionTagline2: string;
}

const VivrantCommunitiesCard = ({
  imgSrc1,
  imgSrc2,
  imgSrc3,
  sectionHeading,
  sectionTagline1,
  sectionTagline2,
}: Props) => {
  return (
    <div className="card max-w-sm bg-[#EAECF0] border border-gray-200 rounded-lg shadow p-2">
      <div className="card-grid-images grid grid-cols-3 gap-2">
        <div className="row-span-2 col-span-2">
          <Image
            src={imgSrc1}
            alt="community-img"
            height={344}
            width={384}
            className="object-cover"
          />
        </div>
        <div className="row-span-1 col-span-1">
          <Image
            src={imgSrc2}
            alt="community-img"
            height={164}
            width={228}
            className="object-cover"
          />
        </div>
        <div className="row-span-1 col-span-1">
          <Image
            src={imgSrc3}
            alt="community-img"
            height={164}
            width={228}
            className="object-cover"
          />
        </div>
      </div>
      <div className="p-5">
        <h5 className="mb-2 text-medium font-bold tracking-tight">
          {sectionHeading}
        </h5>
        <div className="flex justify-between flex-wrap mt-8">
          <div className="">
            <Image
              src="/dummy-image.png"
              height={30}
              width={30}
              alt="profile-picture"
              className="rounded-full mr-2"
            />
            <div className="font-semibold text-sm">{sectionTagline1}</div>
            <div className="font-semibold text-xs">{sectionTagline2}</div>
          </div>
          <Link
            href="/"
            className="bg-[#0A72C7] hover:bg-[#2a73ae] text-white max-h-[40px] font-bold py-2 px-6 rounded"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VivrantCommunitiesCard;
