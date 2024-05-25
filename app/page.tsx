import Image from "next/image";
import HomeNavbar from "./components/reusable/HomeNavbar";
import {
  LANDING_PAGE_BUTTON,
  LANDING_PAGE_VIBRANT_COMMUNITIES_IMAGES,
} from "./utils/constants";
import { v4 as uuidv4 } from "uuid";
import MembershipPlanCard1 from "./components/membership_plan_cards/MembershipPlanCard1";
import MembershipPlanCard2 from "./components/membership_plan_cards/MembershipPlanCard2";
import Footer from "./components/reusable/Footer";
import 'tailwindcss/tailwind.css';


const images = [
  { src: '/mug.png', caption: 'Voyager has been a' },
  { src: '/button.png', caption: "I've made lifelong" },
  { src: '/lady.png', caption: "Voyager's" },
  { src: '/china2.png', caption: 'The interactive demo' },
];
export default function Home() {
  return (
    <main className="w-[full] mx-auto bg-[#FFFCF9] ">
      <div className="mx-20">
        <HomeNavbar />
      </div>
      <div className="bg-[#FFFCF9] ">
        <div className="flex lg:flex-row md:flex-col sm:items-center xs:flex-col justify-between row-1 mx-20">
          <div className="flex flex-col xs:items-center lg:items-start">
            <h1 className=" text-7xl mt-30 md:w-[76.52%] sm:w-[100%] font-englebert">
              Welcome to <br /> our vibrant
            </h1>
            <div className="mt-6 text-2xl md:w-[76.52%] sm:w-[100%] font-space-grotesk text-gray-500">Penatibus erat dui litora est cum tortor at scelerisque nam neque justo, consequat suspendisse l.</div>
            <button className="bg-[#101521] hover:bg-[#2a73ae] text-white font-bold py-4 px-14 rounded-lg mt-10">
              Get started
            </button>
          </div>
          <Image
            src="/fox.png"
            priority
            width={700}
            height={400}
            alt="hero-image"
            className="mt-10"
          />
        </div>
        <div className="row-2 flex flex-col text-center items-centert">
          <div className="flex flex-wrap mt-20 ml-20 gap-10">
            {LANDING_PAGE_VIBRANT_COMMUNITIES_IMAGES.map((data) => (
              <div key={uuidv4()} className="flex justify-center flex-col mb-8 w-1/4">
                <Image
                  src={data.src}
                  height={400}
                  width={400}
                  alt="vivrant-communities"
                  className="object-fill rounded"
                />
                <div className="mt-8 text-3xl font-playfair-display" style={{ fontWeight: 600, fontStyle: 'italic' }}>
                  {data.community_interest}
                </div>
                <div className="mt-8 text-lg font-space-grotesk text-gray-500">
                  {data.interest_taglines}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className=" bg-beige p-4 min-h-screen mt-40">
          <div className="flex flex-wrap gap-4">
            {/* First Column */}
            <div className="flex flex-col gap-6 w-full sm:w-1/2 md:w-1/4">
              <img src="/button1.png" alt="Description 1" className="w-full h-60 object-cover rounded-lg" />
              <img src="/button2.png" alt="Description 2" className="w-full h-60 object-cover rounded-lg" />
              <button className="bg-blue-600 text-white p-4 rounded-full text-lg">Learn More</button>
            </div>

            {/* Second Column */}
            <div className=" grid grid-cols-2 gap-2 w-full sm:w-1/2 md:w-1/4 ">
              <img src="/00.jpg" alt="Description 3" className="w-full h-20 object-cover rounded-tl-full" />
              <img src="/01.jpg" alt="Description 4" className="w-full h-20 object-cover rounded-tr-lg" />
              <img src="/02.jpg" alt="Description 5" className="w-full h-40 object-cover" />
              <img src="/10.jpg" alt="Description 6" className="w-full h-40 object-cover" />
              <img src="/11.jpg" alt="Description 3" className="w-full h-40 object-cover" />
              <img src="/12.jpg" alt="Description 4" className="w-full h-40 object-cover" />
              <img src="/20.jpg" alt="Description 5" className="w-full h-40 object-cover rounded-bl-full" />
              <img src="/21.jpg" alt="Description 6" className="w-full h-40 object-cover rounded-br-lg" />
            </div>

            <div className="flex flex-col justify-center gap-4 w-full sm:w-1/2 md:w-1/4  ">
              <img src="/mobile.png" alt="Description 7" className="" />
            </div>

            <div className="flex flex-col justify-center text-center items-centert w-full sm:w-1/2 md:w-1/5 ">
              <img src="/china.png" alt="" />
            </div>
          </div>
        </div>



        <div className="flex flex-col md:flex-row items-center justify-between p-8 ">
          <div className="flex-1 mb-8 md:mb-0 md:mr-8">
            <h2 className="text-6xl font-serif text-gray-800 ml-16 font-playfair-display" style={{ fontWeight: 500, fontStyle: 'italic' }}>Testimonials</h2>
          </div>
          <div className="w-2/4 h-90  p-16">
            <img src="/test.jpg" alt="" />
          </div>
        </div>


        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-beige min-h-screen">
          <div className="flex-1 mb-8 md:mb-0 md:mr-8 text-center md:text-left ml-20">
            <h2 className="text-5xl font-serif text-gray-800 mb-4 font-playfair-display" style={{ fontWeight: 600, fontStyle: 'italic' }}>Ready to Join the <br /> Adventure?</h2>
            <button className="px-36 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition duration-300 mt-4">
              Get Started
            </button>
          </div>
          <div className=" w-2/4 h-96 px-16">
            <h1 className="text-4xl text-gray-800 mb-4 text-center md:text-left font-playfair-display" style={{ fontWeight: 600, fontStyle: 'italic' }}>From Our Community</h1>
            <p className="text-2xl mb-8 text-center md:text-left mt-10 font-space-grotesk text-gray-500">
              Hear from Voyager travelers as they share their stories of connection, exploration, and personal growth on our platform.
            </p>
            <div className="flex justify-around items-center mt-10">
              <div className="flex flex-col items-center">
                <div className="bg-black p-4 rounded-full">
                  <img src="/logo1.png" alt="Shell" className="h-16 w-16" />
                </div>
                <p className="mt-2 text-gray-600">Shell</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black p-4 rounded-full">
                  <img src="/logo2.png" alt="Ferrari" className="h-16 w-16" />
                </div>
                <p className="mt-2 text-gray-600">Ferrari</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-black p-4 rounded-full">
                  <img src="/logo3.png" alt="Mastercard" className="h-16 w-16" />
                </div>
                <p className="mt-2 text-gray-600">Mastercard</p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex gap-2 p-8 bg-beige">
          {images.map((image, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/4 p-2">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img src={image.src} alt={`Image ${index + 1}`} className="w-full h-auto rounded-lg" />
                <p className="mt-4 text-center font-space-grotesk text-gray-500">"{image.caption}"</p>
              </div>
            </div>
          ))}
        </div>


        <div className="h-screen flex items-center justify-center " style={{ background: "#FFE0E8" }} >
          <div className="flex flex-col items-center text-center">
            <div>
              <h1 className="text-5xl font-playfair-display" style={{ fontWeight: 500 }}>
                Stay Connected
              </h1>
            </div>
            <div className="mt-4 font-space-grotesk text-gray-500">
              <p>
                Follow us on social media to stay up-to-date with the latest Voyager news and adventures
              </p>
            </div>
            <div className="mt-6">
              <button className="px-6 py-2 p-6 bg-blue-500 text-white rounded-full">Follow Now</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
