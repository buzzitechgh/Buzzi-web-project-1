import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface ClickEffect {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const NetworkCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const clickEffectsRef = useRef<ClickEffect[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const requestRef = useRef<number | null>(null);
  
  // Use refs for state accessed inside the animation loop to avoid re-binding/re-renders
  const stateRef = useRef({
    isHovering: false,
    isOnInput: false,
    isMouseDown: false
  });

  useEffect(() => {
    // Detect hover state on clickable elements and inputs
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      const isClickable = 
        tagName === 'a' || 
        tagName === 'button' || 
        target.closest('a') !== null || 
        target.closest('button') !== null ||
        target.getAttribute('role') === 'button';

      const isInput = 
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select';

      stateRef.current.isHovering = isClickable || isInput;
      stateRef.current.isOnInput = isInput;
    };

    const handleMouseDown = (e: MouseEvent) => {
        stateRef.current.isMouseDown = true;
        // Add click ripple effect
        clickEffectsRef.current.push({
            x: e.clientX,
            y: e.clientY,
            radius: 5,
            alpha: 1.0
        });
    };

    const handleMouseUp = () => {
        stateRef.current.isMouseDown = false;
    };
    
    document.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        document.removeEventListener('mouseover', handleMouseOver);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Configuration
    const config = {
      trailLength: 20,
      connectionDistance: 120,
      glowColor: '#00AEEF', // Brand Blue
      secondaryColor: '#00C4DF', // Brand Cyan
      coreColor: '#ffffff',
      darkCoreColor: '#002855', // Navy for white backgrounds
      clickColor: '#FFB800', // Yellow for clicks
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x, y } = mouseRef.current;
      const { isHovering, isOnInput, isMouseDown } = stateRef.current;

      // --- 1. Trail Logic ---
      pointsRef.current.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0
      });

      // Update points
      for (let i = 0; i < pointsRef.current.length; i++) {
        const p = pointsRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
      }

      // Remove dead points
      pointsRef.current = pointsRef.current.filter(p => p.life > 0);
      if (pointsRef.current.length > 25) {
        pointsRef.current.shift();
      }

      ctx.lineCap = 'round';
      
      // Draw Mesh
      for (let i = 0; i < pointsRef.current.length; i++) {
        for (let j = i + 1; j < pointsRef.current.length; j++) {
           const p1 = pointsRef.current[i];
           const p2 = pointsRef.current[j];
           const dx = p1.x - p2.x;
           const dy = p1.y - p2.y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           
           if (dist < config.connectionDistance) {
              ctx.beginPath();
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = `rgba(0, 196, 223, ${Math.min(p1.life, p2.life) * 0.2})`;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
           }
        }
      }

      // Connect trail to current mouse (Spider legs effect)
      pointsRef.current.forEach(p => {
         const dx = p.x - x;
         const dy = p.y - y;
         const dist = Math.sqrt(dx*dx + dy*dy);
         if (dist < config.connectionDistance) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            const grad = ctx.createLinearGradient(x, y, p.x, p.y);
            grad.addColorStop(0, `rgba(0, 174, 239, 0.8)`);
            grad.addColorStop(1, `rgba(0, 196, 223, 0)`);
            ctx.strokeStyle = grad;
            ctx.moveTo(x, y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
         }
      });
      
      // --- 2. Click Effects (Ripple) ---
      clickEffectsRef.current.forEach(effect => {
          effect.radius += 2.5; // Expand speed
          effect.alpha -= 0.03; // Fade speed
          
          if (effect.alpha > 0) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(255, 184, 0, ${effect.alpha})`; // Brand Yellow
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
      });
      clickEffectsRef.current = clickEffectsRef.current.filter(e => e.alpha > 0);

      // --- 3. Cursor Head ---
      
      // Dynamic Colors based on Background/Input state
      const currentCoreColor = isOnInput ? config.darkCoreColor : config.coreColor;
      const currentRingColor = isOnInput ? config.darkCoreColor : config.secondaryColor;

      // Glow
      ctx.shadowBlur = isHovering ? 25 : 15;
      ctx.shadowColor = isOnInput ? 'rgba(0, 40, 85, 0.3)' : config.glowColor;
      
      // Core Dot
      ctx.fillStyle = currentCoreColor;
      ctx.beginPath();
      // Slightly smaller on inputs for precision
      ctx.arc(x, y, isHovering && !isOnInput ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset Shadow for sharp lines
      ctx.shadowBlur = 0;

      // Rotating Ring / Active Ring
      ctx.strokeStyle = currentRingColor;
      ctx.lineWidth = isMouseDown ? 3 : 2; // Thicker when clicking
      ctx.beginPath();
      
      // Animate ring radius
      let ringRadius = isHovering ? 12 : 8;
      if (isMouseDown) ringRadius = 10; // Shrink feedback on press
      if (isOnInput) ringRadius = 6; // Smaller precision ring on inputs
      
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Hover Indicator (Crosshair) - Only if hovering clickable items, not necessarily inputs
      if (isHovering && !isOnInput) {
        ctx.strokeStyle = config.glowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const armLen = isMouseDown ? 10 : 20; 
        
        ctx.moveTo(x - armLen, y);
        ctx.lineTo(x + armLen, y);
        ctx.moveTo(x, y - armLen);
        ctx.lineTo(x, y + armLen);
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        body, a, button, input, select, textarea, [role="button"] {
          cursor: none !important;
        }
      `}</style>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[9999]"
      />
    </>
  );
};

export default NetworkCursor;