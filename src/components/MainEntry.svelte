<script lang="ts">
  import HeadCanvas from './HeadCanvas.svelte';
  import PainScale from './PainScale.svelte';
  import MedicationSelector from './MedicationSelector.svelte';
  import DateSelector from './DateSelector.svelte';
  import type { HeadacheEntry, Point } from '../lib/types';
  import { saveEntry, getEntryByDate } from '../lib/storage';
  import { getToday, debounce } from '../lib/utils';
  import { onMount } from 'svelte';

  interface Props {
    onNavigate: (view: string) => void;
  }

  let { onNavigate }: Props = $props();

  let currentDate = $state(getToday());
  let painScale = $state(0);
  let medications = $state<string[]>([]);
  let frontPoints = $state<Point[]>([]);
  let backPoints = $state<Point[]>([]);
  let notes = $state('');

  const debouncedSave = debounce(async () => {
    if (painScale > 0) {
      const entry: HeadacheEntry = {
        id: new Date(currentDate).toISOString(),
        date: currentDate,
        scale: painScale,
        medication: medications,
        points: {
          front: frontPoints,
          back: backPoints
        },
        notes: notes
      };
      await saveEntry(entry);
    }
  }, 300);

  async function loadEntry(date: string) {
    const entry = await getEntryByDate(date);
    if (entry) {
      painScale = entry.scale;
      medications = entry.medication;
      frontPoints = entry.points.front;
      backPoints = entry.points.back;
      notes = entry.notes;
    } else {
      // Reset to defaults
      painScale = 0;
      medications = [];
      frontPoints = [];
      backPoints = [];
      notes = '';
    }
  }

  function handleDateChange(newDate: string) {
    currentDate = newDate;
    loadEntry(newDate);
  }

  function handlePainScaleChange(scale: number) {
    painScale = scale;
    debouncedSave();
  }

  function handleMedicationChange(meds: string[]) {
    medications = meds;
    debouncedSave();
  }

  function handleFrontPointsChange(points: Point[]) {
    frontPoints = points;
    debouncedSave();
  }

  function handleBackPointsChange(points: Point[]) {
    backPoints = points;
    debouncedSave();
  }

  onMount(() => {
    loadEntry(currentDate);
  });
</script>

<div class="main-entry">
  <header>
    <h1>Kopfschmerz Tagebuch</h1>
    <div class="nav-buttons">
      <button onclick={() => onNavigate('history')}>📅 Historie</button>
      <button onclick={() => onNavigate('analytics')}>📊 Statistik</button>
    </div>
  </header>

  <DateSelector date={currentDate} onChange={handleDateChange} />

  <div class="canvas-container">
    <HeadCanvas
      title="Vorderseite"
      bind:points={frontPoints}
      {painScale}
      onPointsChange={handleFrontPointsChange}
    />
    <HeadCanvas
      title="Rückseite"
      bind:points={backPoints}
      {painScale}
      onPointsChange={handleBackPointsChange}
    />
  </div>

  <PainScale value={painScale} onChange={handlePainScaleChange} />

  <MedicationSelector {medications} onChange={handleMedicationChange} />

  <div class="notes-section">
    <h3>Notizen (optional)</h3>
    <textarea
      bind:value={notes}
      placeholder="Zusätzliche Notizen..."
      oninput={() => debouncedSave()}
    ></textarea>
  </div>
</div>

<style>
  .main-entry {
    max-width: 600px;
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

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .nav-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .nav-buttons button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .nav-buttons button:hover {
    background: #e9e9e9;
    border-color: #999;
  }

  .canvas-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 600px) {
    .canvas-container {
      grid-template-columns: 1fr;
    }
  }

  .notes-section {
    margin-top: 1rem;
  }

  .notes-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }

  textarea {
    width: 100%;
    min-height: 80px;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
  }
</style>
