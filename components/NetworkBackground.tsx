import React, { useEffect, useRef } from 'react';

interface NetworkBackgroundProps {
  className?: string;
}

const NetworkBackground: React.FC<NetworkBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Initialize off-screen

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas size
    const setSize = () => {
      // If the canvas is not fixed (i.e., inside a container), use parent dimensions
      // Check if className contains 'fixed' to decide sizing strategy, or just check parent
      if (canvas.parentElement && getComputedStyle(canvas).position !== 'fixed') {
         width = canvas.parentElement.clientWidth;
         height = canvas.parentElement.clientHeight;
      } else {
         width = window.innerWidth;
         height = window.innerHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
    };
    setSize();

    // Configuration
    const config = {
      // Slightly different colors for visual depth
      particleColor: 'rgba(59, 130, 246)', 
      lineColor: 'rgba(147, 197, 253)', // Lighter blue for lines
      mouseLineColor: 'rgba(59, 130, 246)', // Brighter blue for mouse interaction
      particleCount: Math.min(Math.floor((width * height) / 15000), 60), // Sparse for "silent" feel
      connectionDistance: 180,
      interactionDistance: 250, // Distance for mouse interaction
      baseSpeed: 0.2
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      oscillation: number;
      oscillationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.baseSpeed;
        this.vy = (Math.random() - 0.5) * config.baseSpeed;
        this.size = Math.random() * 1.5 + 1; // Slightly varied size
        // Sine wave properties for smooth fading
        this.oscillation = Math.random() * Math.PI * 2;
        this.oscillationSpeed = 0.01 + Math.random() * 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Oscillate alpha
        this.oscillation += this.oscillationSpeed;
      }

      // Calculate alpha dynamically
      getAlpha() {
        return 0.05 + Math.abs(Math.sin(this.oscillation)) * 0.25; // range 0.05 to 0.3
      }

      draw() {
        if (!ctx) return;
        ctx.globalAlpha = this.getAlpha();
        ctx.fillStyle = config.particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const init = () => {
      particles.length = 0;
      const count = Math.min(Math.floor((width * height) / 15000), 60); // Recalculate count on resize
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const handleMouseMove = (e: MouseEvent) => {
        // If absolute/relative, we need to account for offset if we want mouse interaction relative to canvas
        // But for visual simplicity, clientX/Y works if canvas covers screen or we adjust.
        // For 'upper front page' (Hero), clientY might need adjustment if scrolled, but Hero is at top.
        
        if (canvas.style.position === 'fixed') {
             mouseRef.current = { x: e.clientX, y: e.clientY };
        } else {
             const rect = canvas.getBoundingClientRect();
             mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update and draw particles
      particles.forEach((p, index) => {
        p.update();
        const pAlpha = p.getAlpha();

        // 1. Mouse Interaction
        const dxMouse = p.x - mx;
        const dyMouse = p.y - my;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < config.interactionDistance) {
            // Attraction force: gently pull particle towards mouse
            if (distMouse > 50) { // Don't collapse completely
                 const force = (config.interactionDistance - distMouse) / config.interactionDistance;
                 p.x -= dxMouse * force * 0.03;
                 p.y -= dyMouse * force * 0.03;
            }

            // Draw connection line to mouse
            ctx.beginPath();
            const mouseLineAlpha = (1 - distMouse / config.interactionDistance) * 0.4;
            ctx.strokeStyle = config.mouseLineColor;
            ctx.globalAlpha = mouseLineAlpha;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
        }

        // 2. Peer Connections (Node to Node)
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            ctx.beginPath();
            // Line opacity based on distance and both particle alphas
            // This creates the "fade silently" effect where connections disappear smoothly
            const p2Alpha = p2.getAlpha();
            const distanceFactor = 1 - dist / config.connectionDistance;
            const lineAlpha = distanceFactor * Math.min(pAlpha, p2Alpha) * 0.4; // subtle lines
            
            ctx.strokeStyle = config.lineColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        
        // Draw particle last to be on top of lines
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      setSize();
      init();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Default to fixed if no className provided, otherwise use provided classes
  const defaultClasses = "fixed inset-0 z-[1]";
  const combinedClasses = `pointer-events-none ${className || defaultClasses}`;

  return (
    <canvas
      ref={canvasRef}
      className={combinedClasses}
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

export default NetworkBackground;