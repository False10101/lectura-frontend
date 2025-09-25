import React, { useState, useRef, Fragment, useEffect, useCallback } from "react";
import { CloudArrowUpIcon, DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/solid";
import SideBar from "../components/SideBar";
import { useParams } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "../MdEditor.css";

import mermaid from "mermaid";
import { getCodeString } from 'rehype-rewrite';

const textToFile = (content, filename, type = 'text/plain') => {
    return new File([content], filename, { type });
};

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);

const Code = ({ inline, children = [], className, ...props }) => {
    const demoid = useRef(`dome${randomid()}`);
    const [container, setContainer] = useState(null);
    const [hasError, setHasError] = useState(false);
    const isMermaid = className && /^language-mermaid/.test(className.toLocaleLowerCase());
    const code = children ? getCodeString(props.node.children) : children[0] || "";

    useEffect(() => {
        setHasError(false); // Reset error state on code change
        if (container && isMermaid && demoid.current && code) {
            mermaid.initialize({ startOnLoad: true });
            mermaid.render(demoid.current, code)
                .then(({ svg, bindFunctions }) => {
                    container.innerHTML = svg;
                    if (bindFunctions) {
                        bindFunctions(container);
                    }
                })
                .catch((error) => {
                    console.error("Mermaid render error:", error);
                    setHasError(true); // Set error state to true
                });
        }
    }, [container, isMermaid, code]);

    const refElement = useCallback((node) => {
        if (node !== null) {
            setContainer(node);
        }
    }, []);

    if (isMermaid) {
        // Render the original code block if there's an error
        if (hasError) {
            return <code className={className}>{children}</code>;
        }

        return (
            <Fragment>
                <code id={demoid.current} style={{ display: "none" }} />
                <code className={className} ref={refElement} data-name="mermaid" />
            </Fragment>
        );
    }
    return <code className={className}>{children}</code>;
};


const NoteDetail = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [convertedKey, setConvertedKey] = useState("");
    const [fileName, setFileName] = useState("");
    const [username, setUsername] = useState("Charles");
    const [textMd, setTextMd] = useState("");
    const { noteId } = useParams();

    const [isReplacementMode, setIsReplacementMode] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/note/detail/${noteId}`, {
                    method: 'GET',
                    credentials: "include"
                });

                if (!response.ok) throw new Error('Failed to fetch note details');

                const data = await response.json();
                const note = data.noteResponse;

                const syntheticFile = textToFile(
                    "",
                    note.originalFinalName || `${note.name}.mp4`
                );

                setUploadedFile(syntheticFile);
                setTextMd(note.explanationText);
                setFileName(note.name);

            } catch (error) {
                console.error('Loading Error:', error);
                alert('Loading Error', 'Failed to load note details.');
            }
        };

        if (noteId) {
            fetchDetails();
        }

    }, [noteId]);

    useEffect(() => {
        if (isReplacementMode && uploadedFile) {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            setLoading(true);

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
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            convert();
        }
    }, [uploadedFile, isReplacementMode]);

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setConvertedKey("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsReplacementMode(true);
    };

    const validateAndUpload = (file) => {
        const validTypes = [
            "video/mp4", "video/webm", "video/mov", "audio/mpeg", "audio/mp3",
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


    return (
        <div className="flex w-full h-screen">
            <SideBar />
            <div className="w-[84vw] h-full flex-col">
                <div className="Title-group h-[10%] flex flex-col justify-center px-9">
                    <h1 className="text-3xl font-bold text-[#4C1D95] mb-1">Welcome Back, {username}</h1>
                    <p className="text-sm text-black/60 pt-1">Edit your transcript, regenerate and download your notes.</p>
                </div>
                <div className="Main-content flex h-[90%] items-center justify-evenly border-l-[1px] border-t-[1px] border-[#6B7280]/30">
                    <div className="flex-col flex h-[92%] w-[22.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl">
                        <h1 className="px-4 py-2 font-semibold text-2xl text-[#4C1D95]">Upload your lecture</h1>
                        <div
                            className={`flex w-[80%] h-[30%] border-dashed border-[#4C1D95]/40 items-center rounded-lg my-6 2xl:my-8 py-1 2xl:py-2 mx-auto flex-col
                             transition-all duration-300 hover:border-solid border-[1px] hover:bg-[#4C1D95]/10
                              ${isDragging ? "bg-[#4C1D95]/10 border-solid scale-105" : "bg-transparent border-dashed"}`}
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
                                            : Math.round(uploadedFile.size / (1024 * 1024)) + "MB"}{" "}
                                        • TXT
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleRemoveFile}
                                            className={`text-xs bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition-colors ${loading ? "hidden" : ""}`}
                                        >
                                            Replace
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <label htmlFor="filename" className="w-[80%] flex justify-self-center mb-2 text-sm font-semibold mx-auto">Filename</label>
                        <input
                            id="filename"
                            className=" border-[1px] border-[#4C1D95]/40 w-[80%] flex mx-auto rounded-sm px-2 text-sm py-1 "
                            type="text"
                            placeholder="Lecture Video 1"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <button
                            className="rounded-sm bg-gradient-to-r from-[#4C1D95] via-[#312E81] to-[#1E1B4B] w-[80%] flex mx-auto mt-auto mb-8 py-1 text-white font-semibold"
                            onClick={() => console.log("Regenerate clicked")}
                        >
                            <SparklesIcon className="h-4 w-4 my-auto mr-1 ml-auto" />
                            <span className="mr-auto">Regenerate Notes</span>
                        </button>
                    </div>
                    <div className="flex flex-col h-[92%] w-[68.5%] border-[#4C1D95]/40 border-[1px] rounded-2xl bg-[#faf8fe]">
                        <h1 className="px-5 py-2 font-semibold text-2xl text-[#4C1D95]">Generated Lecture Notes</h1>
                        <div className="w-full h-full p-4 flex flex-grow  overflow-auto">
                            {/* The MDEditor component with Mermaid support */}
                            <MDEditor
                                className="wmde-markdown-var !h-full"
                                value={textMd}
                                onChange={setTextMd}
                                data-color-mode="light"
                                previewOptions={{
                                    components: {
                                        code: Code,
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteDetail;