import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Music, Loader2, Volume2, VolumeX } from "lucide-react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [track, setTrack] = useState<{
    fileUrl: string;
    title: string;
    author: string;
    thumbnail: string;
    videoId: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setTrack(null);
    setIsPlaying(false);
    setProgress(0);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert video");
      }

      setTrack({
        ...data,
        videoId: data.fileUrl.split("/").pop(),
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
      if (value > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      audioRef.current.volume = volume;
    }
  }, [track]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col relative overflow-x-hidden selection:bg-[#7000ff] selection:text-white">
      {/* Background Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#7000ff] rounded-full blur-[160px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#00f2ff] rounded-full blur-[160px] opacity-10 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="h-[80px] px-6 md:px-10 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg flex items-center justify-center">
            <Music className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">YT<span className="text-[#00f2ff]">-AUDIO</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors">Dashboard</span>
          <span className="hover:text-white cursor-pointer transition-colors">History</span>
          <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
          <span className="text-white border-b border-[#00f2ff] pb-1">Converter</span>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 w-full">
          <h1 className="text-4xl md:text-[44px] font-bold mb-6 text-white tracking-tight">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#7000ff]">Amplify</span>?
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Paste any YouTube link below to convert it to a pristine 320kbps audio track. Preview instantly in our custom player.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleConvert} className="w-full max-w-3xl relative mb-4">
          <input
            type="url"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="w-full bg-[#111] border-2 border-white/10 rounded-2xl py-5 px-6 md:px-8 text-lg focus:outline-none focus:border-[#7000ff] transition-all placeholder-gray-600 shadow-[0_0_30px_rgba(0,0,0,0.5)] disabled:opacity-50 pr-32 md:pr-48"
            required
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="absolute right-2 top-2 bottom-2 px-6 md:px-10 bg-gradient-to-r from-[#7000ff] to-[#00f2ff] text-black font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[100px] md:min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Convert"
            )}
          </button>
        </form>

        <div className="flex justify-center gap-3 md:gap-6 text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-500 font-bold mb-4">
          <span>320kbps MP3</span>
          <span className="text-[#7000ff]">•</span>
          <span>Fast Processing</span>
          <span className="text-[#7000ff]">•</span>
          <span>Secure Download</span>
        </div>

        {error && (
          <div className="w-full max-w-2xl p-4 mb-8 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-12 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-[#00f2ff] animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-[#7000ff] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <Music className="text-white animate-pulse" size={32} />
            </div>
            <p className="text-xl font-medium text-[#e0e0e0] animate-pulse tracking-wide">
              Extracting Audio... this may take a minute
            </p>
          </div>
        )}

        {/* Player Section */}
        {track && !loading && (
          <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-white/10 to-transparent p-[1px] rounded-[32px]">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[31px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#7000ff]/5 to-transparent pointer-events-none"></div>
                
                {/* Album Art Placeholder */}
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/10 group">
                  {track.thumbnail ? (
                     <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#111] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Music size={64} className="text-neutral-600" />
                    </div>
                  )}
                  {/* Play Overlay */}
                  <button 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform hover:scale-105 transition-transform">
                      {isPlaying ? (
                        <Pause size={24} className="fill-white text-white" />
                      ) : (
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Track Details & Controls */}
                <div className="flex-1 w-full flex flex-col justify-between md:h-48 py-2 relative z-10">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-widest font-bold">Success</span>
                    </div>
                    <h2 className="text-2xl md:text-[32px] font-bold text-white leading-tight line-clamp-1" title={track.title}>
                      {track.title}
                    </h2>
                    <p className="text-[#00f2ff] font-medium tracking-wide mt-1">{track.author}</p>
                  </div>

                  <div className="mt-auto">
                    {/* Audio Element */}
                    <audio
                      ref={audioRef}
                      src={track.fileUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />

                    {/* Scrub Bar & Fake Waveform */}
                    <div className="mb-4 relative group/scrub">
                       <div className="flex items-end gap-[2px] h-10 md:h-12 mb-2 pointer-events-none">
                         {[...Array(30)].map((_, i) => (
                           <div key={i} className="flex-1 rounded-full transition-colors duration-200" style={{ height: `${Math.max(20, Math.random() * 100)}%`, backgroundColor: progress > (i/30)*100 ? '#7000ff' : '#333' }}></div>
                         ))}
                       </div>
                       <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                    </div>
                    
                    {/* Lower Controls */}
                    <div className="flex gap-4">
                       <a
                          href={`/api/download/${track.videoId}`}
                          download={`${track.title}.mp3`}
                          className="flex-1 h-12 md:h-14 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                          <Download size={20} />
                          Download 320kbps MP3
                       </a>

                       <div className="flex items-center gap-2 relative group/volume">
                          <button onClick={toggleMute} className="w-12 md:w-14 h-12 md:h-14 bg-[#222] text-white rounded-xl flex items-center justify-center hover:bg-[#333] transition-colors border border-white/5">
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          
                          <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/volume:opacity-100 group-hover/volume:visible bg-[#222] p-3 rounded-xl border border-white/10 shadow-2xl transition-all duration-200">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-24 h-1.5 bg-[#333] rounded-full appearance-none cursor-pointer outline-none"
                              style={{
                                background: `linear-gradient(to right, #00f2ff ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%)`
                              }}
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl mx-auto h-[60px] px-6 flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 text-[10px] md:text-[11px] text-gray-600 uppercase tracking-widest relative z-10 pb-6 md:pb-0">
        <span>Powered by yt-dlp & FFmpeg</span>
        <span className="hidden md:inline">© 2024 SonicConvert Engine</span>
        <span>High Quality Extraction</span>
      </footer>

      {/* Global styles for custom range input thumbs */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
        }
        input[type=range]::-moz-range-thumb {
          width: 0;
          height: 0;
          border: 0;
        }
      `}</style>
    </div>
  );
}
