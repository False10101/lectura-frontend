import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";

/**
 * Formats time in seconds into MM:SS or HH:MM:SS format.
 * @param {number} secs Time in seconds.
 * @returns {string} Formatted time string.
 */
const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor(secs % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
};

/**
 * A simple, custom audio player component.
 * @param {object} props
 * @param {string} props.src The URL of the audio file.
 */
function CustomAudioPlayer({ src }) {
  // --- State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // 'progress' is a number from 0 to 100 for visual bar width
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false); // New state for seeking interaction

  // --- Refs ---
  const soundRef = useRef(null);
  const animationFrameRef = useRef(null);
  const progressBarRef = useRef(null); // Ref for the progress bar div

  // --- Effects ---

  // 1. Initialize Howler.js when the 'src' prop changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (src) {
      const sound = new Howl({
        src: [src],
        html5: true, // Important for streaming from presigned URLs
        volume: Howler.volume(), // Maintain global volume settings
        onplay: () => {
          setIsPlaying(true);
          animateProgress();
        },
        onpause: () => {
          setIsPlaying(false);
          cancelAnimationFrame(animationFrameRef.current);
        },
        onend: () => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
          cancelAnimationFrame(animationFrameRef.current);
        },
        onload: () => {
          setDuration(sound.duration());
          // Set initial mute state based on Howler's global mute
          setIsMuted(Howler.mute());
        },
        onmute: () => {
          setIsMuted(Howler.mute());
        },
        // onerror: (id, error) => console.error("Howler Error:", error),
      });
      soundRef.current = sound;
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [src]);

  // --- Animation Loop ---
  const animateProgress = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || !sound.playing()) return;

    const seek = sound.seek() || 0;
    const currentDuration = sound.duration() || 0; // Use a more recent duration

    setCurrentTime(seek);
    setDuration(currentDuration); // Update duration just in case it changes

    // Update progress bar only if not actively seeking by dragging
    if (!isSeeking) {
      const newProgress = (seek / currentDuration) * 100;
      setProgress(isNaN(newProgress) ? 0 : newProgress);
    }

    animationFrameRef.current = requestAnimationFrame(animateProgress);
  }, [isSeeking]); // Re-create if isSeeking changes

  // --- Handlers ---

  const togglePlayPause = () => {
    const sound = soundRef.current;
    if (!sound) return;

    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    Howler.mute(newMuteState); // Howler.js handles global mute
    setIsMuted(newMuteState);
  };

  const handleProgressBarClick = (event) => {
    const sound = soundRef.current;
    if (!sound || !progressBarRef.current || !duration) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = clickX / rect.width; // 0 to 1 value

    const newSeekTime = duration * newProgress;
    sound.seek(newSeekTime);
    setCurrentTime(newSeekTime);
    setProgress(newProgress * 100); // Update visual progress immediately

    // If audio isn't playing, play it when user seeks
    if (!sound.playing()) {
      sound.play();
    }
  };

  // --- Render ---
  return (
    <div className="flex items-center w-full h-full p-2 bg-[#F1F3F4] rounded-full ">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-black hover:text-violet-900 focus:outline-none"
      >
        {isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      {/* Current Time / Duration */}
      <span className="flex-shrink-0 text-xs text-gray-700 mx-2 min-w-[60px] text-center">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Progress Bar (Clickable) */}
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        className="flex-grow h-1.5 bg-[#D9D9D9] rounded-full cursor-pointer overflow-hidden relative group"
      >
        <div
          className="h-full bg-[#595959] rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
        {/* Optional: Add a draggable indicator (more complex, but good for UX) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-violet-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        ></div>
      </div>

      {/* Volume Button */}
      <button
        onClick={toggleMute}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 focus:outline-none ml-2"
      >
        {isMuted ? (
          <SpeakerXMarkIcon className="w-5 h-5" />
        ) : (
          <SpeakerWaveIcon className="w-5 h-5" />
        )}
      </button>

      {/* Volume dropdown on hover would go here, requiring more state/logic */}
    </div>
  );
}

export default CustomAudioPlayer;