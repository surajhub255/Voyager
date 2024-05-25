"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/random_chat_components/Sidebar";
import CategoriesAndGenderDetailsPopup from "@/app/components/random_chat_components/CategoriesAndGenderDetailsPopup";

const RandomChat = () => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const IP_ADDRESS = process.env.NEXT_PUBLIC_SERVER_IP_ADDRESS;
  // console.log("chat message", chatMessages)
  useEffect(() => {
    const newSocket = new WebSocket(
      `ws://${IP_ADDRESS}/v1.0/voyager_web_socket/ws`
    );

    newSocket.onopen = () => {
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // console.log("message", message)
      setChatMessages((prevMessages) => [...prevMessages, message.content]);
    };

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line
  }, []); // Only runs once when the component mounts

  function sendMessage(event: React.KeyboardEvent<HTMLInputElement>) {
    if (
      event.key === "Enter" &&
      socket &&
      socket.readyState === WebSocket.OPEN &&
      inputMessage.length >=1
    ) {
      // console.log("input message", inputMessage);
      // Send the message
      socket.send(JSON.stringify({ content: inputMessage }));
      setInputMessage(""); // Clear input field after sending message
    } else {
      console.error("WebSocket connection is not open.");
    }
  }

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex flex-col justify-between h-[100vh] w-full ml-[25%] bg-[#393E46]">
        {/* {chatMessages.length <= 0 && <CategoriesAndGenderDetailsPopup />} */}
        <div className="bg-blue text-white p-2">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className="bg-white rounded-l-full rounded-r-full px-3 py-1 text-black max-w-fit mb-3"
            >
              {message}
            </div>
          ))}
        </div>
        <div className="w-full">
          <div className="w-[95%] mx-auto mb-4">
            <input
              type="text"
              id="default-input"
              className="text-gray-50 text-sm rounded-lg block p-2.5 w-full bg-gray-500 outline-none"
              placeholder="Enter text here..."
              value={inputMessage}
              onChange={handleMessageChange}
              onKeyDown={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomChat;
