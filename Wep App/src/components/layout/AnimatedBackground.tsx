'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const orbs = el.querySelectorAll<HTMLDivElement>('.orb');
    let animId: number;
    let t = 0;

    const animate = () => {
      t += 0.003;
      orbs.forEach((orb, i) => {
        const speed = 0.3 + i * 0.15;
        const xOff = Math.sin(t * speed + i * 2.1) * 80;
        const yOff = Math.cos(t * speed * 0.7 + i * 1.5) * 60;
        orb.style.transform = `translate(${xOff}px, ${yOff}px)`;
      });
      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-animation" ref={canvasRef}>
      {/* Teal orb - top right */}
      <div
        className="orb absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Cyan orb - bottom left */}
      <div
        className="orb absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          bottom: '-15%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Gold orb - center */}
      <div
        className="orb absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '40%',
          left: '30%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.03) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Subtle teal orb - top left */}
      <div
        className="orb absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          top: '20%',
          left: '5%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.04) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}
