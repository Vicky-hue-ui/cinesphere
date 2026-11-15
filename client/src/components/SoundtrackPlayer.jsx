import React, { useState, useRef } from 'react';
import { Play, Pause, Disc3, Volume2, VolumeX, Music2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

export const SoundtrackPlayer = ({
  movieTitle,
  posterPath,
  videoKey,
  trackTitle = 'Official Theme / Soundtrack',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const iframeRef = useRef(null);

  // If no direct videoKey provided from clips/videos, create search query link
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${movieTitle} official soundtrack theme score`
  )}`;

  const effectiveKey = videoKey;

  const togglePlay = () => {
    if (!effectiveKey) {
      window.open(ytSearchUrl, '_blank');
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      setIsPlaying(true);
      return;
    }

    // Control YouTube iframe via postMessage API
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden YouTube Iframe for Audio Playback */}
      {effectiveKey && hasStarted && (
        <div className="hidden pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${effectiveKey}?enablejsapi=1&autoplay=1&origin=${window.location.origin}`}
            title={`${movieTitle} Soundtrack Audio`}
            allow="autoplay"
          />
        </div>
      )}

      {/* Floating Mini Player Widget */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-in-out ${
          isMinimized ? 'translate-y-2' : ''
        }`}
      >
        <div className="relative group bg-neutral-950/90 backdrop-blur-xl border border-red-900/40 hover:border-red-600/70 rounded-2xl shadow-[0_8px_32px_rgba(220,38,38,0.25)] p-3 text-white max-w-sm sm:max-w-md w-[calc(100vw-3rem)] sm:w-80">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-neutral-900 border-b">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-red-500">
              <Music2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Original Score</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={ytSearchUrl}
                target="_blank"
                rel="noreferrer"
                title="Search on YouTube"
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-xs flex items-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                {isMinimized ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Player Body */}
          {!isMinimized && (
            <div className="flex items-center gap-3">
              {/* Vinyl / Spinning Disc Animation */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-full bg-neutral-900 border-2 border-neutral-800 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center overflow-hidden transition-transform duration-700 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  {posterPath ? (
                    <img
                      src={posterPath}
                      alt={movieTitle}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <Disc3 className="w-8 h-8 text-red-500/70" />
                  )}
                  {/* Center vinyl spindle */}
                  <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  </div>
                </div>
              </div>

              {/* Track Metadata */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-sm font-semibold text-white truncate tracking-tight">
                  {trackTitle}
                </h4>
                <p className="text-xs text-neutral-400 truncate">
                  {movieTitle} OST
                </p>
                {isPlaying && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-1 h-3.5 bg-red-600 rounded-full animate-pulse delay-150"></span>
                    <span className="text-[10px] text-red-400 font-mono ml-1">PLAYING</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {hasStarted && (
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] transition transform active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play Theme'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Minimized Compact Bar */}
          {isMinimized && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Disc3
                  className={`w-5 h-5 text-red-500 flex-shrink-0 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                />
                <span className="text-xs text-neutral-300 truncate">
                  {movieTitle} — OST
                </span>
              </div>
              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition ml-2 flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SoundtrackPlayer;