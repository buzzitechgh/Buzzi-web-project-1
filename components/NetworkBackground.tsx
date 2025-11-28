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

    // Configuration for subtle effect
    const config = {
      particleColor: '59, 130, 246', // RGB: Brand Blue
      lineColor: '147, 197, 253',    // RGB: Lighter Blue
      particleCount: Math.min(Math.floor((width * height) / 20000), 50), // Sparse density
      connectionDistance: 160,
      interactionDistance: 200,
      baseSpeed: 0.15, // Slow movement
      mouseForce: 0.02 // Gentle pull
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
        this.size = Math.random() * 1.5 + 1; 
        
        // Sine wave properties for smooth fading
        this.oscillation = Math.random() * Math.PI * 2;
        this.oscillationSpeed = 0.005 + Math.random() * 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges for continuous flow
        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;
        
        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;

        // Oscillate alpha
        this.oscillation += this.oscillationSpeed;
      }

      // Calculate alpha dynamically (Breathing effect)
      getAlpha() {
        // Returns value between 0.1 and 0.4
        return 0.1 + (Math.sin(this.oscillation) + 1) * 0.15;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(${config.particleColor}, ${this.getAlpha()})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const init = () => {
      particles.length = 0;
      const count = Math.min(Math.floor((width * height) / 20000), 50);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const handleMouseMove = (e: MouseEvent) => {
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

      particles.forEach((p, index) => {
        p.update();
        const pAlpha = p.getAlpha();

        // 1. Mouse Interaction
        const dxMouse = p.x - mx;
        const dyMouse = p.y - my;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < config.interactionDistance) {
            const force = (config.interactionDistance - distMouse) / config.interactionDistance;
            
            // Gentle attraction
            p.x -= dxMouse * force * config.mouseForce;
            p.y -= dyMouse * force * config.mouseForce;

            // Draw faint line to mouse
            if (distMouse < config.interactionDistance * 0.8) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${config.lineColor}, ${0.2 * (1 - distMouse / config.interactionDistance)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mx, my);
                ctx.stroke();
            }
        }

        // 2. Peer Connections (Node to Node)
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            ctx.beginPath();
            // Line opacity based on distance and particle life
            const distFactor = 1 - dist / config.connectionDistance;
            const lineAlpha = distFactor * Math.min(pAlpha, p2.getAlpha()) * 0.8; 
            
            ctx.strokeStyle = `rgba(${config.lineColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        
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
    />
  );
};

export default NetworkBackground;