import React, { useState, useRef, useEffect } from "react";
import { CloudArrowUpIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import SideBar from "../components/SideBar";

const Home = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [convertedKey, setConvertedKey] = useState("");


  const remove = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/note/deleteTemp/${convertedKey}`,
        {
          method: 'DELETE',
          credentials: 'include',
        })

      if (!res.ok) {
        alert("There was a problem while converting, please try again.");
      }

      setConvertedKey("");

    } catch (error) {
      console.log(error)
      alert("There was a problem while converting, please try again.");
    }
  }

  useEffect(() => {
    if (uploadedFile) {

      const formData = new FormData();
      formData.append("file", uploadedFile)
      setLoading(true);

      try {
        const convert = async () => {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/note/convert`,
            {
              method: "POST",
              credentials: 'include',
              body: formData,
            })
          const data = await res.json();
          setConvertedKey(data.key)
        }

        convert();

      } catch (error) {
        console.log(error)
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  }, [uploadedFile])

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      remove();
    }
  };

  const validateAndUpload = (file) => {
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/mov",
      "audio/mpeg",
      "audio/mp3",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Invalid File Type", "Please upload only MP3, MP4 files.");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      alert("File Too Large", "File size exceeds 200MB limit.");
      return;
    }

    setUploadedFile(file);
  };

  return (
    <div className="flex w-full h-screen">
      <SideBar />
      <div className="w-[80vw] h-full flex-col">
        <div className="Title-group h-[15%] border-rose-950 border-[1px]"></div>
        <div className="Main-content flex h-[85%] border-rose-950 border-[1px] items-center justify-evenly">
          <div className="flex-col h-[92%] w-[22.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl">
            <h1 className="px-4 py-2">Upload your lecture</h1>
            <div
              className={`flex w-[80%] h-[30%] border-dashed items-center rounded-lg my-6 2xl:my-8 py-1 2xl:py-2 mx-auto flex-col
             transition-all duration-300 hover:border-solid border-[1px] hover:border-[#00BFFF] hover:bg-[rgba(0,191,255,0.1)]
              ${isDragging
                  ? "bg-[#00bfff]/10 border-solid border-[#00bfff] scale-105"
                  : "bg-transparent border-dashed"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/mp4, video/webm, video/mov, audio/mpeg, audio/mp3"
                onChange={handleFileChange}
              />
              {!uploadedFile ? (
                <div
                  className="group flex flex-col w-full h-full mx-auto justify-center items-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <CloudArrowUpIcon
                    className={`text-[#00BFFF] w-12 h-12 2xl:w-15 2xl:h-15 transition-transform duration-300 group-hover:scale-110`}
                  />
                  <h1 className="text-sm text-center w-[80%] text-black mb-2">
                    Drag and drop or click to upload
                  </h1>
                  <span className="text-xs text-center text-black">
                    MP4 or MP3 files only (max 500MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                  <DocumentTextIcon className="w-10 h-10 2xl:w-12 2xl:h-12 text-[#00BFFF] mb-3" />
                  <h2 className="text-sm font-medium text-black pb-2 truncate w-full text-center">
                    {uploadedFile.name}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {uploadedFile.size < 1024 * 1024
                      ? Math.round(uploadedFile.size / 1024) + "KB"
                      : Math.round(uploadedFile.size / (1024 * 1024)) +
                      "MB"}{" "}
                    • TXT
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleRemoveFile}
                      className={`text-xs bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition-colors ${loading ? "hidden" : ""}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex h-[92%] w-[68.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
