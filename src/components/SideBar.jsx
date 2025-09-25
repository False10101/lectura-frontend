import React from "react";
import Logo from "../assets/LecturaLogo.png";
import { useNavigate, useLocation, replace, useParams } from "react-router-dom";
import { HomeIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { useState } from "react";
import { Videotape } from "lucide-react";

const SideBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [historyList, setHistoryList] = useState([]);
  const { noteId } = useParams();

  const handleRedirect = (route) => {
    if (pathname != route) {
      navigate(route, { replace: true });
    }
  };

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
      setHistoryList();
    }
  }, [pathname]);

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
          className={`w-[90%] flex h-max py-3 ${
            pathname === "/note" || pathname === ""
              ? "bg-[#4C1D95] drop-shadow-lg text-white "
              : ""
          } rounded-xl px-3 items-center`}
        >
          <HomeIcon className="w-4 h-4 " />
          <span className="truncate ml-2">Home</span>
        </div>
        <div
          onClick={() => handleRedirect("/quiz")}
          className={`w-[90%] flex h-max py-3 ${
            pathname === "quiz" ? "bg-[#4C1D95] drop-shadow-lg text-white " : ""
          } rounded-xl px-3 items-center`}
        >
          <LightBulbIcon className="w-4 h-4 " />
          <span className="truncate ml-2">Personality Quiz</span>
        </div>

        <div className="w-full mt-4 flex flex-col overflow-hidden">
          <h1 className="text-xl mb-4 ml-2 font-semibold">History</h1>

          <div className="w-full flex flex-col overflow-auto">
            {historyList.map((history, index) => (
              <div key={index} className="w-full h-min py-0.5 px-2 my-3 flex">
                <Videotape size={20} className="w-[10%]" color="#4C1D95" />
                <div
                  onClick={() => handleRedirect(`note/${history.id}`)}
                  className={`truncate w-[90%] ml-3 ${
                    history.id == noteId ? "bg-black" : ""
                  }`}
                >
                  {history.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
