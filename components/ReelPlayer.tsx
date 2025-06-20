
import { useState,useRef } from 'react';
import { useInView } from 'react-intersection-observer';
interface ReelPlayerProps {
  src: string;
  poster?: string; // optional thumbnail
}


export function ReelPlayer({ src, poster }: ReelPlayerProps) {
  const [ref, inView] = useInView({ threshold: 0.7 });
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      // setIsPlaying(true);
    } else {
      videoRef.current.pause();
      // setIsPlaying(false);
    }
  };

  return (
    <div
      ref={ref}
      className="h-screen snap-start flex items-center justify-center bg-black relative"
      onClick={togglePlay}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <img
            src={poster || '/thumbnail.jpg'}
            alt="thumbnail"
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute text-white text-sm">Loading...</div>
        </div>
      )}

      {inView && (
        <video
          ref={videoRef}
          src={src}
          className="max-h-full max-w-full w-auto h-auto rounded-md shadow-lg z-20"
          autoPlay
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}