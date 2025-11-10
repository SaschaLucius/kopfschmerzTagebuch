<script lang="ts">
  import type { Point } from '../lib/types';
  import { getPainColor } from '../lib/utils';

  interface Props {
    title: string;
    points: Point[];
    painScale: number;
    onPointsChange: (points: Point[]) => void;
  }

  let { title, points = $bindable([]), painScale, onPointsChange }: Props = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  const POINT_RADIUS = 8;

  function setupCanvas() {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    drawCanvas();
  }

  function drawCanvas() {
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw head outline (simple oval)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * 0.35, height * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw points
    const color = getPainColor(painScale);
    points.forEach(point => {
      ctx!.fillStyle = color;
      ctx!.globalAlpha = 0.7;
      ctx!.beginPath();
      ctx!.arc(point.x * width, point.y * height, POINT_RADIUS, 0, Math.PI * 2);
      ctx!.fill();
      
      // Add border to point
      ctx!.globalAlpha = 1;
      ctx!.strokeStyle = '#000';
      ctx!.lineWidth = 1;
      ctx!.stroke();
    });
    
    ctx.globalAlpha = 1;
  }

  function handleCanvasClick(e: MouseEvent | TouchEvent) {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }
    
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    
    // Check if clicked on existing point to remove it
    const clickedPointIndex = points.findIndex(p => {
      const dx = (p.x - x) * rect.width;
      const dy = (p.y - y) * rect.height;
      return Math.sqrt(dx * dx + dy * dy) < POINT_RADIUS * 1.5;
    });
    
    if (clickedPointIndex !== -1) {
      // Remove point
      const newPoints = points.filter((_, i) => i !== clickedPointIndex);
      points = newPoints;
      onPointsChange(newPoints);
    } else {
      // Add new point
      const newPoints = [...points, { x, y }];
      points = newPoints;
      onPointsChange(newPoints);
    }
    
    drawCanvas();
  }

  $effect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  });

  $effect(() => {
    // Redraw when points or painScale changes
    drawCanvas();
  });
</script>

<div class="head-canvas-container">
  <h3>{title}</h3>
  <canvas
    bind:this={canvas}
    onclick={handleCanvasClick}
    ontouchstart={(e) => {
      e.preventDefault();
      handleCanvasClick(e);
    }}
  ></canvas>
</div>

<style>
  .head-canvas-container {
    text-align: center;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }

  canvas {
    width: 100%;
    height: 250px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    touch-action: none;
    background: #f9f9f9;
  }
</style>
