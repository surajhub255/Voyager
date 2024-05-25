"use client";
import React, { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaUserFriends, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const router = useRouter();

  return (
    <div className="fixed h-[100vh] px-3 py-4 bg-[#25262D] top-0 w-[25%]">
      <div className="text-white font-bold text-xl"><a href="/">Voyager</a></div>
      <div className="w-[100%] mt-5 flex bg-black rounded pt-2 pb-2 justify-center items-center gap-1">
        <button
          className={`w-1/2 flex ml-2 p-2 rounded justify-center items-center gap-2 ${
            activeTab === "chat" ? "bg-gray-100 text-black" : "text-gray-50"
          }`}
          id="chat"
          onClick={() => setActiveTab("chat")}
        >
          <IoChatbubbleEllipsesOutline />
          Chat
        </button>
        <button
          className={`w-1/2 p-2 rounded mr-2 flex justify-center items-center gap-2  ${
            activeTab === "friends" ? "bg-gray-100 text-black" : "text-gray-50"
          }`}
          id="friends"
          onClick={() => setActiveTab("friends")}
        >
          <FaUserFriends />
          Friends
        </button>
      </div>
      <button
        className="fixed flex bottom-0 left-0 w-[25%] mx-auto p-2 rounded bg-black text-gray-50 hover:text-black hover:bg-gray-50"
        onClick={() => router.push("/voyager/my_account")}
      >
        <span className="ml-2">Edit Interest and Location</span>
        <span className="ml-5 font-medium text-xl">
          <FaEdit />
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
