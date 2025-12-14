import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo'; // Reuse the logo component for brand consistency

const LoadingScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Initialization Animation Config
    const config = {
      particleCount: 60,
      baseSpeed: 2,
      color: 'rgba(59, 130, 246, 0.8)', // Brand Blue
      lineColor: 'rgba(59, 130, 246, 0.4)',
      centerX: width / 2,
      centerY: height / 2,
    };

    class InitParticle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      size: number;
      speed: number;
      angle: number;
      radius: number;

      constructor() {
        // Start from random positions outside or near center
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 300 + 100; // Start distance
        this.x = config.centerX + Math.cos(this.angle) * this.radius;
        this.y = config.centerY + Math.sin(this.angle) * this.radius;
        
        // Target is a structured grid or cluster near center
        this.targetX = config.centerX + (Math.random() - 0.5) * 400;
        this.targetY = config.centerY + (Math.random() - 0.5) * 200;
        
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.05 + 0.02;
      }

      update() {
        // Orbit and move towards target
        this.angle += this.speed;
        
        // Spiraling in effect
        if (this.radius > 0) {
           this.radius -= 0.5;
        }

        // Complex movement: Orbiting while closing in
        // We blend orbital movement with target attraction for a "assembling" look
        const orbitX = config.centerX + Math.cos(this.angle) * this.radius;
        const orbitY = config.centerY + Math.sin(this.angle) * this.radius;
        
        // Linear interpolation towards "final" chaotic position to blend with background style later
        this.x += (orbitX - this.x) * 0.1;
        this.y += (orbitY - this.y) * 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: InitParticle[] = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new InitParticle());
    }

    let animationId: number;
    const animate = () => {
      // Create a trail effect for speed sensation
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Dark slate background with trail
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect particles to center and each other if close
        // Center connection (Initializing Hub)
        const distToCenter = Math.hypot(p.x - config.centerX, p.y - config.centerY);
        if (distToCenter < 200) {
           ctx.beginPath();
           ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distToCenter/200})`;
           ctx.lineWidth = 0.5;
           ctx.moveTo(p.x, p.y);
           ctx.lineTo(config.centerX, config.centerY);
           ctx.stroke();
        }

        // Inter-node connections
        for (let j = index + 1; j < particles.length; j++) {
           const p2 = particles[j];
           const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
           if (dist < 100) {
             ctx.beginPath();
             ctx.strokeStyle = config.lineColor;
             ctx.lineWidth = 0.2;
             ctx.moveTo(p.x, p.y);
             ctx.lineTo(p2.x, p2.y);
             ctx.stroke();
           }
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="z-10 flex flex-col items-center justify-center relative p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 flex justify-center items-center"
        >
          {/* Increased height for loading screen logo visibility */}
          <Logo className="h-32 w-auto" lightMode={true} />
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex items-center space-x-3"
        >
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-blue-200/60 text-xs font-mono tracking-wide">INITIALIZING SYSTEM NODES...</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;