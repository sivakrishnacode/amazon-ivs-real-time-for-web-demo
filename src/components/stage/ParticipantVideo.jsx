import React, { useEffect, useRef } from 'react';

export default function ParticipantVideo({ stream, isLocal }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // stream should already be a MediaStream (not a track)
    el.srcObject = stream instanceof MediaStream ? stream : null;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: isLocal ? 'scaleX(-1)' : 'none',
        borderRadius: 'inherit',
      }}
    />
  );
}
