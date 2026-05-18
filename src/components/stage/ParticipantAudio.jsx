import React, { useEffect, useRef } from 'react';

export default function ParticipantAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (stream) {
      audio.srcObject = stream;
    } else {
      audio.srcObject = null;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />;
}
