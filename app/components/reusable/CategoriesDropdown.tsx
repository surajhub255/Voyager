"use client";

import { useState } from "react";

interface Category {
  ID: number;
  Category: string;
  Name: string;
}

interface Props {
  category: string;
}

const CategoriesDropdown = ({ category }: Props) => {
  const [isMenuOpen, setIsLocationMenuOpen] = useState<boolean>(false);
  const [locationsList, setLocationsList] = useState<Category[]>([]);
  const [InterestList, setInterestList] = useState<Category[]>([]);
  const [value, setvalue] = useState<string>("");
  // these two state variable values will be used to send data to backend
  const [LocationValue, setLocationValue] = useState<string | null>(null);
  const [interestsValue, setInterestsValue] = useState<string | null>(null);

  const IP_ADDRESS = process.env.NEXT_PUBLIC_SERVER_IP_ADDRESS;

  const Category = category.toLowerCase();
  
  const handleOpenMenu = async () => {
    // It will run when isMenuOpen is false which will make 'if' condition !false i.e. true.
    if (!isMenuOpen) {
      try {
        const response = await fetch(
          `http://${IP_ADDRESS}/v1.0/voyager/categories/${Category}`
        );
        const list = await response.json();
        if (Category === "interests") {
          setInterestList(list);
        } else if (Category === "location") {
          setLocationsList(list);
        }
      } catch (error) {
        alert("Error: " + error);
      }
    }
    setIsLocationMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="font-medium bg-white focus:outline-none text-sm px-5 py-2 text-center inline-flex items-center rounded-3xl"
        onClick={handleOpenMenu}
      >
        {category}: {value}
        <svg
          className="w-2.5 h-2.5 ms-3 cursor-pointer"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
          stroke-linecap
        </svg>
      </div>
      {isMenuOpen && (
        <div
          id="dropdown"
          className="z-10 bg-gray-50 rounded-lg shadow w-44 mt-1"
        >
          <ul
            className="py-2 text-sm font-medium"
            aria-labelledby="dropdownDefaultButton"
          >
            {Category === "location" &&
              locationsList.map(({ ID, Name }) => (
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  key={ID}
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    const element = event.target as HTMLElement;
                    setvalue(element.innerHTML);
                    setLocationValue(element.innerHTML);
                  }}
                >
                  {Name}
                </li>
              ))}
            {Category === "interests" &&
              InterestList.map(({ ID, Name }) => (
                <li
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  key={ID}
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    const element = event.target as HTMLElement;
                    setvalue(element.innerHTML);
                    setInterestsValue(element.innerHTML);
                  }}
                >
                  {Name}
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default CategoriesDropdown;
