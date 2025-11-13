import React from "react";
import Logo from "../assets/LecturaLogo.png";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  HomeIcon,
  LightBulbIcon,
  UserCircleIcon, // Added
  ArrowRightOnRectangleIcon, // Added
} from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { useState } from "react";
import { Videotape } from "lucide-react";

const SideBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [historyList, setHistoryList] = useState([]);
  const [username, setUsername] = useState("User"); // Added state for username
  const { noteId } = useParams();

  const handleRedirect = (route) => {
    if (pathname != route) {
      navigate(route, { replace: true });
    }
  };

  // --- ADDED ---
  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`, // Assumes this is your logout route
        {
          method: "POST", // POST is safer for actions that change state
          credentials: "include", // Essential for sending the token cookie
        }
      );

      if (response.ok) {
        // Redirect to login page and clear navigation history
        navigate("/login", { replace: true });
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Effect for fetching history
  useEffect(() => {
    try {
      const fetchHistory = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/note/history`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setHistoryList(data.noteList);
      };

      fetchHistory();
    } catch (error) {
      console.log(error);
      setHistoryList([]); // Set to empty array on error
    }
  }, [pathname]);

  // --- ADDED ---
  // Effect for fetching user info (runs once on mount)
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/detail`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.userDetail && data.userDetail.name) {
            setUsername(data.userDetail.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };
    fetchUserDetail();
  }, []); // Empty dependency array so it runs only once

  // Helper to capitalize first letter
  const capitalize = (s) => {
    if (typeof s !== "string" || !s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="w-[16vw] h-full border-rose-950 px-3  flex flex-col">
      <div className="w-full h-min flex py-4 border-b-[1px] border-[#6B7280]/30 items-center">
        <img src={Logo} alt="Logo" className="w-12 h-12 flex" />
        <div className="flex flex-col justify-center">
          <span className="text-2xl text-[#4C1D95] font-bold ml-3 -mt-1">
            Lectura
          </span>
          <span className=" text-sm ml-3">Lecture Note Explainer</span>
        </div>
      </div>

      <div className="w-full h-min flex py-4 flex-col flex-grow overflow-hidden pb-9">
        <div
          onClick={() => handleRedirect("/note")}
          className={`w-full flex h-max py-3 cursor-pointer  my-1 ${
            pathname.includes("note")
              ? "bg-[#4C1D95] drop-shadow-lg text-white "
              : "hover:bg-[#4C1D95]/10"
          } rounded-xl px-3 items-center`}
        >
          <HomeIcon className="w-4 h-4 " />
          <span className="truncate ml-2">Home</span>
        </div>
        <div
          onClick={() => handleRedirect("/quiz")}
          className={`w-full flex h-max py-3 cursor-pointer  my-1 ${
            pathname.includes("quiz")
              ? "bg-[#4C1D95] drop-shadow-lg text-white "
              : "hover:bg-[#4C1D95]/10"
          } rounded-xl px-3 items-center`}
        >
          <LightBulbIcon className="w-4 h-4 " />
          <span className="truncate ml-2">Personality Quiz</span>
        </div>

        <div className="w-full mt-4 flex flex-col overflow-hidden">
          <h1 className="text-xl mb-4 ml-2 font-semibold">History</h1>

          <div className="w-full flex flex-col overflow-auto no-scrollbar">
            {historyList.map((history, index) => (
              <div
                key={index}
                className={`w-full h-min py-0.5 px-2 my-1 py-2 rounded-lg flex  cursor-pointer select-none scrollwheel ${
                  history.id == noteId
                    ? "bg-[#4C1D95] text-white"
                    : "hover:bg-[#4C1D95]/10"
                }`}
              >
                <Videotape size={20} className="w-[10%] mt-0.5" />
                <div
                  onClick={() => handleRedirect(`/note/${history.id}`)}
                  className={`truncate w-[90%] ml-3`}
                >
                  {history.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ADDED PROFILE & LOGOUT BAR --- */}
      <div className="w-full h-min flex py-4 border-t-[1px] border-[#6B7280]/30 items-center">
        <div
          onClick={() => handleRedirect("/user")}
          className="flex items-center cursor-pointer group flex-1 overflow-hidden" // flex-1 to take available space
        >
          <UserCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-[#4C1D95] transition-colors flex-shrink-0" />
          <span className="ml-2 font-medium text-gray-700 group-hover:text-[#4C1D95] transition-colors truncate">
            {capitalize(username)}
          </span>
        </div>

        <div
          onClick={handleLogout}
          className="ml-2 cursor-pointer p-1 rounded-md hover:bg-red-100" // Added padding for easier click
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SideBar;