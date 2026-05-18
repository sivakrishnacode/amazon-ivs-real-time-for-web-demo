import React, { useEffect, useRef, useState } from 'react';

export default function VideoStatic() {
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({
        width: Math.floor(width) || 300,
        height: Math.floor(height) || 300,
      });
    });

    observer.observe(canvas.parentElement || canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = null;

    const drawStatic = () => {
      const w = size.width;
      const h = size.height;
      if (w <= 0 || h <= 0) return;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const intensity = Math.floor(Math.random() * 256);
        data[i] = intensity;
        data[i + 1] = intensity;
        data[i + 2] = intensity;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(drawStatic);
    };

    drawStatic();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size.width}
      height={size.height}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
