import { useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Play, Pause } from 'lucide-react'; // optional: install lucide-react or replace with SVG

interface ReelPlayerProps {
  src: string;
  poster?: string;
}

export function ReelPlayer({ src, poster }: ReelPlayerProps) {
  const [ref, inView] = useInView({ threshold: 0.7 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={ref}
      className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-b from-black to-gray-900 relative"
      onClick={togglePlay}
    >
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
          <img
            src={poster || '/thumbnail.jpg'}
            alt="thumbnail"
            className="w-full h-full object-cover blur-md brightness-75"
          />
          <div className="absolute text-white text-sm font-medium animate-pulse">
            Loading...
          </div>
        </div>
      )}

      {/* Video */}
      {inView && (
        <video
          ref={videoRef}
          src={src}
          className={`transition-opacity duration-500 rounded-xl shadow-2xl z-20 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } max-w-full max-h-full`}
          autoPlay
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        />
      )}

      {/* Play/Pause Icon */}
      <div className="absolute bottom-10 right-10 z-30 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-opacity duration-300">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </div>
    </div>
  );
}
