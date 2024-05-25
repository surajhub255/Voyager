/**
 * @returns first membership plan card on landing page
 */
const MembershipPlanCard1 = () => {
  return (
    <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow sm:p-8">
      <h5 className="mb-4 text-xl font-medium">Basic</h5>
      <div className="flex items-baseline">
        <div className="text-4xl font-extrabold tracking-tight">FREE</div>
      </div>
      <ul role="list" className="space-y-5 my-7">
        <li className="flex items-center">
          <svg
            className={`flex-shrink-0 w-4 h-4 text-[#EAECF0]`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span className="text-base font-normal leading-tight ms-3">
            Access to starter features
          </span>
        </li>
        <li className="flex">
          <svg
            className={`flex-shrink-0 w-4 h-4 text-[#EAECF0] `}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span className="text-base font-normal leading-tight ms-3">
            Limited monthly rewards
          </span>
        </li>
        <li className="flex">
          <svg
            className={`flex-shrink-0 w-4 h-4 text-[#EAECF0]`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span className="text-base font-normal leading-tight ms-3">
            Enjoy a trial period
          </span>
        </li>
      </ul>
      <button
        type="button"
        className={`text-black bg-[#EAECF0] hover:bg-[#EAECF0] focus:ring-4 focus:outline-none hover:shadow-md focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center`}
      >
        Start for Free
      </button>
    </div>
  );
};

export default MembershipPlanCard1;
