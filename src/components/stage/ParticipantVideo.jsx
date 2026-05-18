import React, { useEffect, useRef } from 'react';

export default function ParticipantVideo({ stream, isLocal }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className="participant-card-video"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: isLocal ? 'scaleX(-1)' : 'none',
      }}
    />
  );
}
