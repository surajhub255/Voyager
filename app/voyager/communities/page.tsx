"use client";

import CommunitiesNavbar from "../../components/communities_components/CommunitiesNavbar";
import { v4 as uuidv4 } from "uuid";
import {
  COMMUNITY_PAGE_BUTTONS,
  VIBRANT_COMMUNITY_CARD_IMAGES,
} from "../../utils/constants";
import Image from "next/image";
import VivrantCommunitiesCard from "../../components/communities_components/VivrantCommunitiesCard";
import Footer from "@/app/components/reusable/Footer";
import HomeNavbar from "@/app/components/reusable/HomeNavbar";
import { FaDiscord } from "react-icons/fa";

const Community = () => {
  return (
    // <main className="w-[95vw] mx-auto p-10">
    //   <CommunitiesNavbar />
    //   <div>
    //     <div className="text-lg font-bold mt-10 mb-5">
    //       Discover New Connections
    //     </div>
    //     <div className="flex flex-wrap gap-3">
    //       {COMMUNITY_PAGE_BUTTONS.map((data) => (
    //         <button
    //           key={uuidv4()}
    //           className="bg-[#EAECF0] font-semibold py-2 px-4 rounded hover:shadow-md"
    //         >
    //           {data.text}
    //         </button>
    //       ))}
    //     </div>
    //     <div className="grid-images grid grid-cols-3 gap-5 mt-10">
    //       <div className="row-span-2 col-span-2">
    //         <Image
    //           src="https://img.freepik.com/premium-photo/business-network-hand-shakes_777576-2834.jpg?w=740"
    //           alt="img"
    //           height={568}
    //           width={888}
    //           className="object-cover rounded"
    //         />
    //       </div>
    //       <div className="row-span-1 col-span-1">
    //         <Image
    //           src="https://img.freepik.com/free-photo/view-3d-islamic-lantern_23-2151112512.jpg?t=st=1716012965~exp=1716016565~hmac=858b24ad9e9d0d06bf022baa0961fdf7c192d7c09b38aade943bd4e2bfd25cf8&w=740"
    //           alt="img"
    //           height={272}
    //           width={432}
    //           className="object-cover rounded"
    //         />
    //       </div>
    //       <div className="row-span-1 col-span-1">
    //         <Image
    //           src="https://img.freepik.com/premium-photo/holographic-wireframe-representation-global-world-planet-earth-laptop_973328-2856.jpg?w=740"
    //           alt="img"
    //           height={272}
    //           width={432}
    //           className="object-cover rounded"
    //         />
    //       </div>
    //     </div>
    //     <div className="row-2 mt-10">
    //       <div className="text-lg font-bold mt-10 mb-5">
    //         Discover Vibrant Communities
    //       </div>
    //       <div className="flex flex-wrap gap-5 justify-center">
    //         <VivrantCommunitiesCard
    //           imgSrc1={VIBRANT_COMMUNITY_CARD_IMAGES.card1.src1}
    //           imgSrc2={VIBRANT_COMMUNITY_CARD_IMAGES.card1.src2}
    //           imgSrc3={VIBRANT_COMMUNITY_CARD_IMAGES.card1.src3}
    //           sectionHeading="Discover New Connections"
    //           sectionTagline1="Dynamic rewards"
    //           sectionTagline2="Meet new people"
    //         />
    //         <VivrantCommunitiesCard
    //           imgSrc1={VIBRANT_COMMUNITY_CARD_IMAGES.card2.src1}
    //           imgSrc2={VIBRANT_COMMUNITY_CARD_IMAGES.card2.src2}
    //           imgSrc3={VIBRANT_COMMUNITY_CARD_IMAGES.card2.src3}
    //           sectionHeading="Explore the Possibilities"
    //           sectionTagline1="Unlock new experiences"
    //           sectionTagline2="Find your tribe"
    //         />
    //       </div>
    //     </div>
    //     <div className="flex justify-center mt-14 mb-12">
    //       <button className="bg-[#EAECF0] font-semibold py-2 px-4 rounded hover:shadow-md">
    //         Discover More
    //       </button>
    //     </div>
    //   </div>
    //   <hr className="mt-5" />
    //   <Footer />
    // </main>

    <main className="w-[full] mx-auto bg-slate-400 h-[710px]">
      <div className="">
        <HomeNavbar />
      </div>

      <div className="flex justify-between mx-10 mt-10 ">
        <div className=" w-[40%] border-4">
          <div className="text-white">
            <table className="text-center border-separate border-spacing-4  w-full">
              <tr className="bg-slate-800">
                <th className="border border-slate-600 p-2">Roles</th>
                <th className="border border-slate-600 p-2">Reputation Points</th>
                <th className="border border-slate-600 p-2">Eligibility</th>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Moderator</td>
                <td className="border border-slate-600">20</td>
                <td className="border border-slate-600">Yes</td>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Contributor</td>
                <td className="border border-slate-600">2</td>
                <td className="border border-slate-600">Yes</td>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Classic Member</td>
                <td className="border border-slate-600">0</td>
                <td className="border border-slate-600">No</td>
              </tr>
            </table>
          </div>
          
          <div className="mt-20 text-white">
            <table className="text-center border-separate border-spacing-4  w-full">
              <tr className="bg-slate-800">
                <th className="border border-slate-600 p-2">UserName</th>
                <th className="border border-slate-600 p-2">Address</th>
                <th className="border border-slate-600 p-2">Role</th>
                <th className="border border-slate-600 p-2">Loan</th>
                <th className="border border-slate-600 p-2">Registration Date</th>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Crazy Eagle</td>
                <td className="border border-slate-600">0x1245</td>
                <td className="border border-slate-600">Contributor</td>
                <td className="border border-slate-600">Yes</td>
                <td className="border border-slate-600">5th May</td>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Desi Coder</td>
                <td className="border border-slate-600">0xAbc</td>
                <td className="border border-slate-600">Member</td>
                <td className="border border-slate-600">No</td>
                <td className="border border-slate-600">5th May</td>
              </tr>
              <tr className="bg-slate-600">
                <td className="border border-slate-600">Hulk</td>
                <td className="border border-slate-600">0xBcd</td>
                <td className="border border-slate-600">Member</td>
                <td className="border border-slate-600">No</td>
                <td className="border border-slate-600">5th May</td>
              </tr>
            </table>
          </div>
        </div>

        <div className="w-[50%]">
          <div className="float-right mr-32">
          <a href=""><FaDiscord className="text-5xl"/></a>
          <button className="text-white bg-black p-2 px-6 rounded-lg mt-6">Endorse</button>
          <h3 className="text-xl mt-6">
            Name: Desi Coder
          </h3>
          <h3 className="text-xl ">
            Address: 0xAbc
          </h3>
          <button className="text-white bg-black p-2 px-6 rounded-lg mt-6">Add a new role</button> <br />
          <button className="text-white bg-black p-2 px-6 rounded-lg mt-32">Unseake</button>
          </div>
        </div>


      </div>
      {/* <Footer /> */}
    </main>
  );
};

export default Community;

