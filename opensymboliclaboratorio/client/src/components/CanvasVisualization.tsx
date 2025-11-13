import { useEffect, useRef } from 'react';
import type { Conceptron } from '@shared/schema';

interface CanvasVisualizationProps {
  conceptron: Conceptron | null;
  isPlaying: boolean;
  className?: string;
}

const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

export function CanvasVisualization({ conceptron, isPlaying, className = '' }: CanvasVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const lastValidColorRef = useRef('#3B82F6');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!conceptron || !isPlaying) {
      particlesRef.current = [];
      return;
    }

    const particleCount = 30;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      newParticles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1,
        size: Math.random() * 3 + 2,
      });
    }
    
    particlesRef.current = newParticles;
  }, [conceptron, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateAndDrawParticles = (centerX: number, centerY: number, color: string) => {
      const particles = particlesRef.current;

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;

        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(centerX + particle.x, centerY + particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      particlesRef.current = particles.filter(p => p.life > 0);
    };

    const drawWaveform = (width: number, height: number, frequency: number, color: string) => {
      ctx.save();
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = 30;
      const waveLength = 200;
      const speed = timeRef.current * 0.1;

      for (let x = 0; x < width; x++) {
        const y = height - 60 + Math.sin((x / waveLength) * frequency * 0.01 - speed) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      drawGrid(ctx, width, height);

      if (conceptron) {
        const currentColor = isValidHexColor(conceptron.color) 
          ? conceptron.color 
          : lastValidColorRef.current;
        
        if (isValidHexColor(conceptron.color)) {
          lastValidColorRef.current = conceptron.color;
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const intensity = isPlaying ? 1 + Math.sin(timeRef.current * 0.01) * 0.3 : 1;
        const baseSize = Math.min(width, height) * 0.2;
        const size = baseSize * intensity * (conceptron.tone / 1000);

        drawShape(ctx, centerX, centerY, size, conceptron.shape, currentColor, intensity);

        if (isPlaying) {
          updateAndDrawParticles(centerX, centerY, currentColor);
          drawWaveform(width, height, conceptron.tone, currentColor);
        }

        drawDataOverlay(ctx, width, height, conceptron);
      }

      timeRef.current += 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [conceptron, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'linear-gradient(135deg, hsl(217, 5%, 8%) 0%, hsl(217, 5%, 12%) 100%)' }}
      data-testid="canvas-visualization"
    />
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
  ctx.lineWidth = 1;

  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: string,
  color: string,
  intensity: number
) {
  ctx.save();
  
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  glow.addColorStop(0, hexToRgba(color, 0.5));
  glow.addColorStop(0.5, hexToRgba(color, 0.125));
  glow.addColorStop(1, hexToRgba(color, 0));
  
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
    case 'triangle':
      drawPolygon(ctx, x, y, size, 3);
      break;
    case 'square':
      ctx.rect(x - size, y - size, size * 2, size * 2);
      break;
    case 'pentagon':
      drawPolygon(ctx, x, y, size, 5);
      break;
    case 'hexagon':
      drawPolygon(ctx, x, y, size, 6);
      break;
  }
  
  ctx.globalAlpha = 0.3 + intensity * 0.3;
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.stroke();

  ctx.restore();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number
) {
  const angle = (Math.PI * 2) / sides;
  ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
  
  for (let i = 1; i <= sides; i++) {
    ctx.lineTo(
      x + radius * Math.cos(i * angle),
      y + radius * Math.sin(i * angle)
    );
  }
  
  ctx.closePath();
}

function drawDataOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  conceptron: Conceptron
) {
  ctx.save();
  ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
  ctx.font = '12px JetBrains Mono, monospace';

  const padding = 20;
  const data = [
    `C: ${conceptron.color}`,
    `F: ${conceptron.shape}`,
    `T: ${conceptron.tone} Hz`,
  ];

  data.forEach((text, i) => {
    ctx.fillText(text, padding, padding + i * 20);
  });

  ctx.restore();
}
