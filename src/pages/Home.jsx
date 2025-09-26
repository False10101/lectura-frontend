import React, { useState, useRef, useEffect } from "react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/solid";

const steps = [
  { key: "preparing", label: "Preparing File", icon: MusicalNoteIcon }, // pending
  { key: "transcribing", label: "Transcribing Audio", icon: ArrowPathIcon },
  { key: "converting", label: "Generating Notes", icon: DocumentTextIcon },
  { key: "finalizing", label: "Finalizing Notes", icon: SparklesIcon },
  { key: "completed", label: "Completed", icon: CheckCircleIcon },
];

const StepLoader = ({ currentStep, completedColor = "#4C1D95" }) => {
  return (
    <div className="flex justify-between items-center w-full">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const Icon = step.icon;

        return (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 relative"
          >
            {isDone ? (
              <CheckCircleIcon
                className={`w-10 h-10 text-[${completedColor}] animate-pulse`}
              />
            ) : (
              <Icon
                className={`w-10 h-10 ${
                  isActive ? "text-[#4C1D95] animate-bounce" : "text-gray-400"
                }`}
              />
            )}
            <span
              className={`mt-2 text-sm font-medium text-center ${
                isActive
                  ? "text-[#4C1D95]"
                  : isDone
                  ? `text-[${completedColor}]`
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>

            {/* Connector line except for last step */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute top-5 left-[calc(50%+20px)] w-full h-0.5 ${
                  isDone ? `bg-[${completedColor}]` : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const GenerateLoadingModal = ({ loading, loadingMessage }) => {
  if (!loading) return null;

  // Map backend status to step index
  const mapStatusToStep = (status) => {
    if (!status) return 0;
    switch (status.toLowerCase()) {
      case "pending":
        return 0; // Preparing File
      case "transcribing":
        return 1;
      case "transcribed":
        return 1; // optional, still second step active
      case "converting":
        return 2;
      case "finalizing":
        return 3;
      case "completed":
        return 4; // mark last step complete
      case "failed":
        return 0; // or highlight as failed
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white border border-[#4C1D95] rounded-xl p-8 w-[70%] shadow-2xl">
        <h3 className="text-2xl font-semibold mb-8 text-center text-[#4C1D95]">
          Regenerating Notes
        </h3>
        <StepLoader currentStep={mapStatusToStep(loadingMessage)} />
      </div>
    </div>
  );
};

const LoadingModal = ({ loading, loadingMessage }) => {
  if (!loading) {
    return null;
  }

  return (
    <div className="fixed flex inset-0 bg-black/60 backdrop-blur-sm justify-center items-center z-50">
      <div className="bg-white border border-[#4C1D95] rounded-xl p-8 w-[25%] h-[30%] m-auto self-center flex justify-center flex-col shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-t-4 border-[#4C1D95] border-t-transparent rounded-full animate-spin" />
        <h3 className="text-xl font-semibold mb-2">
          {loadingMessage.charAt(0).toUpperCase() + loadingMessage.slice(1)}...
        </h3>
      </div>
    </div>
  );
};

const UploadModal = ({ uploading, fileName }) => {
  if (!uploading) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white border border-[#4C1D95] rounded-xl p-6 w-[25%] h-[22%] flex flex-col items-center shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-[#4C1D95]">
          Uploading File...
        </h3>
        <div className="w-16 h-16 border-4 border-t-4 border-[#4C1D95] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

const FetchDetailsModal = ({ loading, message }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white border border-[#4C1D95] rounded-xl p-6 w-[25%] h-[22%] flex flex-col justify-center items-center shadow-2xl">
        <div className="w-16 h-16 border-4 border-t-4 border-[#4C1D95] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-center text-[#4C1D95] font-semibold">{message}</h3>
      </div>
    </div>
  );
};

const Home = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [convertedKey, setConvertedKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [username, setUsername] = useState("");
  const [vark, setVark] = useState("");

  const navigate = useNavigate();
  const [pollingNoteId, setPollingNoteId] = useState(null);

  const remove = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/note/deleteTemp/${convertedKey}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        alert("There was a problem while converting, please try again.");
      }

      setConvertedKey("");
      setFileName("");
    } catch (error) {
      console.log(error);
      alert("There was a problem while converting, please try again.");
    }
  };

  useEffect(() => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      setUploading(true);

      try {
        const convert = async () => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/note/convert`,
              {
                method: "POST",
                credentials: "include",
                body: formData,
              }
            );
            const data = await res.json();
            setConvertedKey(data.key);
            setFileName(uploadedFile.name);
          } catch (err) {
            console.log(err);
          } finally {
            setUploading(false); // Only here
          }
        };

        convert();
      } catch (error) {
        console.log(error);
      }
    }
  }, [uploadedFile]);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Generating notes...");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/note/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Add this line
          },
          credentials: "include",
          body: JSON.stringify({
            fileName: fileName,
            convertedKey: convertedKey,
          }),
        }
      );
      const data = await res.json();
      console.log(data.noteId);
      setPollingNoteId(data.noteId);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    if (!pollingNoteId) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/note/status/${pollingNoteId}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Could not get job status.");
        const data = await response.json();
        setLoadingMessage(
          data.status.charAt(0).toUpperCase() + data.status.slice(1)
        );
        if (data.status.toLowerCase() === "completed") {
          clearInterval(intervalId);
          setLoading(false);
          setLoadingMessage("");
          navigate(`/note/${pollingNoteId}`, { replace: true });
        } else if (data.status.toLowerCase() === "failed") {
          clearInterval(intervalId);
          setLoading(false);
          setLoadingMessage("");
          alert(
            "Generation Failed",
            data.errorMessage || "An unknown error occurred."
          );
          setPollingNoteId(null);
        }
      } catch (error) {
        console.error(error);
        clearInterval(intervalId);
        setLoading(false);
        setLoadingMessage("");
        alert(
          "Status Check Error",
          "An error occurred while checking the note status."
        );
        setPollingNoteId(null);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [pollingNoteId]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/info`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setUsername(data.name);
      setVark(data.vark_type);
    };
    fetchUserDetail();
  }, []);
  return (
    <div className="flex w-full h-screen">
      <UploadModal uploading={uploading} fileName={uploadedFile?.name} />
      <FetchDetailsModal
        loading={loading && loadingMessage.includes("Loading")}
        message="Loading Content..."
      />
      <GenerateLoadingModal
        loading={loading && !loadingMessage.includes("Loading")}
        loadingMessage={loadingMessage}
      />
      <SideBar />
      <div className="w-[84vw] h-full flex-col">
        <div className="Title-group h-[10%] flex flex-col justify-center px-9">
          <h1 className="text-3xl font-bold text-[#4C1D95] mb-1">
            Welcome Back, {username.charAt(0).toUpperCase() + username.slice(1)}
          </h1>
          <p className="text-sm text-black/60 pt-1">
            Edit your transcript, regenerate and download your notes.
          </p>
        </div>
        <div className="Main-content flex h-[90%] items-center justify-evenly border-l-[1px] border-t-[1px] border-[#6B7280]/30">
          <div className="flex-col flex h-[92%] w-[22.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl">
            <h1 className="px-4 py-2 font-semibold text-2xl text-[#4C1D95]">
              Upload your lecture
            </h1>
            <div
              className={`flex w-[80%] h-[30%] border-dashed border-[#4C1D95]/40 items-center rounded-lg my-6 2xl:my-8 py-1 2xl:py-2 mx-auto flex-col
             transition-all duration-300 hover:border-solid border-[1px] hover:bg-[#4C1D95]/10
              ${
                isDragging
                  ? "bg-[#4C1D95]/10 border-solid scale-105"
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
                    className={`text-[#4C1D95] w-12 h-12 2xl:w-15 2xl:h-15 transition-transform duration-300 group-hover:scale-110`}
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
                  <DocumentTextIcon className="w-10 h-10 2xl:w-12 2xl:h-12 text-[#4C1D95] mb-3" />
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
                      className={`text-xs bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition-colors ${
                        loading ? "hidden" : ""
                      }`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label
              for="filename"
              className="w-[80%] flex justify-self-center mb-2 text-sm font-semibold mx-auto"
            >
              Filename
            </label>
            <input
              id="filename"
              className=" border-[1px] border-[#4C1D95]/40 w-[80%] flex mx-auto rounded-sm px-2 text-sm py-2 "
              type="text"
              placeholder="Lecture Video 1"
              defaultValue={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <button
              className="rounded-sm cursor-pointer select-none bg-gradient-to-r from-[#4C1D95] via-[#312E81] to-[#1E1B4B] w-[83%] flex mx-auto mt-auto mb-8 py-1 text-white font-semibold"
              onClick={handleGenerate}
            >
              <SparklesIcon className="h-4 w-4 my-auto mr-1 ml-auto" />
              <span className="mr-auto">Generate Notes</span>
            </button>
          </div>
          <div className="flex flex-col h-[92%] w-[68.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl bg-[#faf8fe]">
            <h1 className="px-5 py-3 font-semibold text-2xl text-[#4C1D95]">
              Generated Lecture Notes
            </h1>

            <span className="w-full flex flex-col h-max my-auto space-y-6">
              <DocumentTextIcon className="w-25 h-25 mx-auto bg-[#4C1D95]/10 py-5 rounded-xl text-[#4C1D95]" />
              <span className="mx-auto text-2xl font-bold">
                No Notes Generated Yet!
              </span>
              <span className="mx-auto">
                Upload a transcript or recording to begin generating your
                personalized notes.
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
