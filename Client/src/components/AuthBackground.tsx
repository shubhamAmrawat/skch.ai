import { useEffect, useRef } from 'react';

interface FloatingShape {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'circle' | 'square' | 'triangle' | 'hexagon';
  color: string;
}

const colors = [
  'rgba(148, 163, 184, 0.08)',   // slate-400
  'rgba(148, 163, 184, 0.06)',   // slate-400 lighter
  'rgba(203, 213, 225, 0.07)',   // slate-300
  'rgba(100, 116, 139, 0.06)',   // slate-500
  'rgba(148, 163, 184, 0.05)',   // slate-400 very light
];

function createShape(width: number, height: number): FloatingShape {
  const types: FloatingShape['type'][] = ['circle', 'square', 'triangle', 'hexagon'];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 32 + 12,
    speedX: (Math.random() - 0.5) * 0.08,
    speedY: (Math.random() - 0.5) * 0.08,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    opacity: Math.random() * 0.2 + 0.1,
    type: types[Math.floor(Math.random() * types.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function drawShape(ctx: CanvasRenderingContext2D, shape: FloatingShape) {
  ctx.save();
  ctx.translate(shape.x, shape.y);
  ctx.rotate((shape.rotation * Math.PI) / 180);
  ctx.globalAlpha = shape.opacity;
  ctx.fillStyle = shape.color;
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = 0.5;

  switch (shape.type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'square':
      ctx.beginPath();
      ctx.roundRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size, 8);
      ctx.fill();
      ctx.stroke();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -shape.size / 2);
      ctx.lineTo(shape.size / 2, shape.size / 2);
      ctx.lineTo(-shape.size / 2, shape.size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'hexagon':
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = (shape.size / 2) * Math.cos(angle);
        const y = (shape.size / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
  }

  ctx.restore();
}

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const shapesRef = useRef<FloatingShape[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create floating shapes - fewer for less distraction
    const shapeCount = Math.min(6, Math.floor((window.innerWidth * window.innerHeight) / 200000));
    const shapes: FloatingShape[] = [];
    for (let i = 0; i < shapeCount; i++) {
      shapes.push(createShape(canvas.width, canvas.height));
    }
    shapesRef.current = shapes;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle mesh gradient - light theme
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(148, 163, 184, 0.03)');
      gradient.addColorStop(0.5, 'rgba(203, 213, 225, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shapes = shapesRef.current;
      const mouse = mouseRef.current;

      shapes.forEach((shape) => {
        // Subtle mouse repulsion - gentle aesthetic reaction
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = shape.x - mouse.x;
          const dy = shape.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200 && distance > 0) {
            const force = (200 - distance) / 200 * 0.015;
            shape.speedX += (dx / distance) * force;
            shape.speedY += (dy / distance) * force;
          }
        }

        // Update position - slow, calm movement
        shape.x += shape.speedX;
        shape.y += shape.speedY;
        shape.rotation += shape.rotationSpeed;

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        // Draw shape
        drawShape(ctx, shape);
      });

      // Very subtle mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        gradient.addColorStop(0, 'rgba(148, 163, 184, 0.03)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

