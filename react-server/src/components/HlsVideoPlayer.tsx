import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

function HlsVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      // Cleanup on unmount or src change
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Some browsers (Safari, iOS) support HLS natively
      video.src = src;
    } else {
      console.error('HLS not supported in this browser');
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      className="w-full h-full object-cover"
    />
  );
}

export default HlsVideoPlayer;
