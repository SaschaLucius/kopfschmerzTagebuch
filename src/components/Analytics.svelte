<script lang="ts">
  import { onMount } from 'svelte';
  import type { HeadacheEntry, Point } from '../lib/types';
  import { getEntriesInRange } from '../lib/storage';
  import { getPainColor, formatDate, addDays } from '../lib/utils';

  interface Props {
    onNavigate: (view: string) => void;
  }

  let { onNavigate }: Props = $props();

  let timeRange = $state(30);
  let entries = $state<HeadacheEntry[]>([]);
  let showFront = $state(true);
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  async function loadData() {
    const endDate = formatDate(new Date());
    const startDate = formatDate(addDays(new Date(), -timeRange));
    entries = await getEntriesInRange(startDate, endDate);
    drawHeatmap();
  }

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
    
    drawHeatmap();
  }

  function drawHeatmap() {
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw head outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * 0.35, height * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Collect all points with their pain scales
    const pointsData: Array<{point: Point, scale: number}> = [];
    entries.forEach(entry => {
      const points = showFront ? entry.points.front : entry.points.back;
      points.forEach(point => {
        pointsData.push({ point, scale: entry.scale });
      });
    });
    
    // Create heatmap grid
    const gridSize = 20;
    const heatGrid: number[][] = [];
    for (let i = 0; i < gridSize; i++) {
      heatGrid[i] = new Array(gridSize).fill(0);
    }
    
    // Count points in each grid cell
    pointsData.forEach(({point, scale}) => {
      const gridX = Math.floor(point.x * gridSize);
      const gridY = Math.floor(point.y * gridSize);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        heatGrid[gridY][gridX] += scale;
      }
    });
    
    // Find max value for normalization
    let maxValue = 0;
    heatGrid.forEach(row => {
      row.forEach(val => {
        if (val > maxValue) maxValue = val;
      });
    });
    
    // Draw heatmap
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    heatGrid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const intensity = value / maxValue;
          const scale = Math.ceil(intensity * 10);
          ctx!.fillStyle = getPainColor(scale);
          ctx!.globalAlpha = intensity * 0.7;
          ctx!.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      });
    });
    
    ctx.globalAlpha = 1;
    
    // Draw individual points on top
    pointsData.forEach(({point, scale}) => {
      const color = getPainColor(scale);
      ctx!.fillStyle = color;
      ctx!.globalAlpha = 0.6;
      ctx!.beginPath();
      ctx!.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
      ctx!.fill();
    });
    
    ctx.globalAlpha = 1;
  }

  function calculateAveragePain(): number {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.scale, 0);
    return Math.round((total / entries.length) * 10) / 10;
  }

  function getMostCommonMedication(): string {
    const medCounts = new Map<string, number>();
    entries.forEach(entry => {
      entry.medication.forEach(med => {
        medCounts.set(med, (medCounts.get(med) || 0) + 1);
      });
    });
    
    let maxMed = '';
    let maxCount = 0;
    medCounts.forEach((count, med) => {
      if (count > maxCount) {
        maxCount = count;
        maxMed = med;
      }
    });
    
    return maxMed || 'Keine';
  }

  function handleTimeRangeChange(range: number) {
    timeRange = range;
    loadData();
  }

  function toggleView() {
    showFront = !showFront;
    drawHeatmap();
  }

  $effect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  });

  onMount(() => {
    loadData();
  });
</script>

<div class="analytics">
  <header>
    <button onclick={() => onNavigate('main')}>← Zurück</button>
    <h1>Statistik</h1>
    <button onclick={() => onNavigate('history')}>📅 Historie</button>
  </header>

  <div class="time-range-selector">
    <button
      class:active={timeRange === 7}
      onclick={() => handleTimeRangeChange(7)}
    >
      7 Tage
    </button>
    <button
      class:active={timeRange === 30}
      onclick={() => handleTimeRangeChange(30)}
    >
      30 Tage
    </button>
    <button
      class:active={timeRange === 90}
      onclick={() => handleTimeRangeChange(90)}
    >
      90 Tage
    </button>
    <button
      class:active={timeRange === 365}
      onclick={() => handleTimeRangeChange(365)}
    >
      365 Tage
    </button>
  </div>

  <div class="stats-summary">
    <div class="stat-card">
      <div class="stat-label">Einträge</div>
      <div class="stat-value">{entries.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ø Schmerz</div>
      <div class="stat-value" style="color: {getPainColor(Math.round(calculateAveragePain()))}">
        {calculateAveragePain()}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Häufigstes Medikament</div>
      <div class="stat-value-small">{getMostCommonMedication()}</div>
    </div>
  </div>

  <div class="heatmap-container">
    <div class="heatmap-header">
      <h2>Schmerzpunkte Heatmap</h2>
      <button class="toggle-view" onclick={toggleView}>
        {showFront ? '🔄 Rückseite' : '🔄 Vorderseite'}
      </button>
    </div>
    
    <div class="canvas-wrapper">
      <canvas bind:this={canvas}></canvas>
      {#if entries.length === 0}
        <div class="no-data">Keine Daten im ausgewählten Zeitraum</div>
      {/if}
    </div>
  </div>

  <div class="pain-timeline">
    <h3>Schmerzintensität über Zeit</h3>
    <div class="timeline-chart">
      {#each entries.slice(0, 30) as entry}
        <div class="timeline-bar-container">
          <div
            class="timeline-bar"
            style="height: {entry.scale * 10}%; background: {getPainColor(entry.scale)}"
            title="{entry.date}: {entry.scale}/10"
          ></div>
          <div class="timeline-date">
            {new Date(entry.date).getDate()}.
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .analytics {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #ddd;
  }

  header button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 0.875rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .time-range-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .time-range-selector button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .time-range-selector button:hover {
    background: #e9e9e9;
  }

  .time-range-selector button.active {
    background: #4CAF50;
    color: white;
    border-color: #45a049;
  }

  .stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 2px solid #ddd;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }

  .stat-value-small {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
  }

  .heatmap-container {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
  }

  .heatmap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }

  .toggle-view {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .canvas-wrapper {
    position: relative;
  }

  canvas {
    width: 100%;
    height: 400px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .no-data {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
    font-size: 1.2rem;
  }

  .pain-timeline {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #333;
  }

  .timeline-chart {
    display: flex;
    gap: 0.25rem;
    align-items: flex-end;
    height: 200px;
    overflow-x: auto;
  }

  .timeline-bar-container {
    flex: 1;
    min-width: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .timeline-bar {
    width: 100%;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    transition: all 0.2s;
  }

  .timeline-bar:hover {
    opacity: 0.8;
    transform: scaleY(1.05);
  }

  .timeline-date {
    font-size: 0.7rem;
    color: #666;
    margin-top: 0.25rem;
  }
</style>
