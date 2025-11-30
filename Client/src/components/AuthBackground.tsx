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
  'rgba(99, 102, 241, 0.15)',   // indigo
  'rgba(139, 92, 246, 0.15)',   // purple
  'rgba(236, 72, 153, 0.12)',   // pink
  'rgba(59, 130, 246, 0.12)',   // blue
  'rgba(16, 185, 129, 0.10)',   // emerald
];

function createShape(width: number, height: number): FloatingShape {
  const types: FloatingShape['type'][] = ['circle', 'square', 'triangle', 'hexagon'];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 60 + 20,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.3,
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
  ctx.strokeStyle = shape.color.replace('0.1', '0.3');
  ctx.lineWidth = 1;

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
  const mouseRef = useRef({ x: 0, y: 0 });

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

    // Create floating shapes
    const shapeCount = Math.min(15, Math.floor((window.innerWidth * window.innerHeight) / 80000));
    const shapes: FloatingShape[] = [];
    for (let i = 0; i < shapeCount; i++) {
      shapes.push(createShape(canvas.width, canvas.height));
    }
    shapesRef.current = shapes;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw mesh gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw second gradient
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.7,
        0,
        canvas.width * 0.6,
        canvas.height * 0.6,
        canvas.width * 0.6
      );
      gradient2.addColorStop(0, 'rgba(236, 72, 153, 0.04)');
      gradient2.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const shapes = shapesRef.current;
      const mouse = mouseRef.current;

      shapes.forEach((shape) => {
        // Update position
        shape.x += shape.speedX;
        shape.y += shape.speedY;
        shape.rotation += shape.rotationSpeed;

        // Mouse repulsion
        const dx = shape.x - mouse.x;
        const dy = shape.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          shape.speedX += (dx / distance) * force * 0.02;
          shape.speedY += (dy / distance) * force * 0.02;
        }

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        // Dampen velocity
        shape.speedX *= 0.99;
        shape.speedY *= 0.99;

        // Draw shape
        drawShape(ctx, shape);
      });

      // Draw mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        mouseGradient.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
        mouseGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
        mouseGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
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

