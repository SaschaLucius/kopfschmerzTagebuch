<script lang="ts">
  import { onMount } from 'svelte';
  import type { HeadacheEntry } from '../lib/types';
  import { getAllEntries } from '../lib/storage';
  import { getPainColor, formatDate, parseDate, addDays } from '../lib/utils';

  interface Props {
    onNavigate: (view: string) => void;
  }

  let { onNavigate }: Props = $props();

  let entries = $state<HeadacheEntry[]>([]);
  let selectedEntry = $state<HeadacheEntry | null>(null);
  let currentMonth = $state(new Date());

  async function loadEntries() {
    entries = await getAllEntries();
  }

  function getEntriesMap(): Map<string, HeadacheEntry> {
    const map = new Map<string, HeadacheEntry>();
    entries.forEach(entry => map.set(entry.date, entry));
    return map;
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add padding days from previous month
    const firstDayOfWeek = firstDay.getDay();
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0
    
    for (let i = paddingDays; i > 0; i--) {
      days.push(addDays(firstDay, -i));
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 weeks
    for (let i = 1; i <= remainingDays; i++) {
      days.push(addDays(lastDay, i));
    }
    
    return days;
  }

  function changeMonth(delta: number) {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    currentMonth = newDate;
  }

  function selectDay(date: Date) {
    const dateStr = formatDate(date);
    const entry = getEntriesMap().get(dateStr);
    if (entry) {
      selectedEntry = entry;
    }
  }

  function closeDetail() {
    selectedEntry = null;
  }

  onMount(() => {
    loadEntries();
  });
</script>

<div class="history-calendar">
  <header>
    <button onclick={() => onNavigate('main')}>← Zurück</button>
    <h1>Historie</h1>
    <button onclick={() => onNavigate('analytics')}>📊 Statistik</button>
  </header>

  <div class="month-navigator">
    <button onclick={() => changeMonth(-1)}>◀</button>
    <h2>{currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</h2>
    <button onclick={() => changeMonth(1)}>▶</button>
  </div>

  <div class="calendar">
    <div class="weekday-header">
      {#each ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as day}
        <div class="weekday">{day}</div>
      {/each}
    </div>
    
    <div class="days-grid">
      {#each getDaysInMonth(currentMonth) as day}
        {@const dateStr = formatDate(day)}
        {@const entry = getEntriesMap().get(dateStr)}
        {@const isCurrentMonth = day.getMonth() === currentMonth.getMonth()}
        
        <button
          class="day-cell"
          class:other-month={!isCurrentMonth}
          class:has-entry={entry}
          style={entry ? `background-color: ${getPainColor(entry.scale)}` : ''}
          onclick={() => selectDay(day)}
        >
          <span class="day-number">{day.getDate()}</span>
          {#if entry}
            <span class="pain-value">{entry.scale}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="legend">
    <h3>Legende</h3>
    <div class="legend-items">
      <div class="legend-item">
        <div class="legend-color" style="background: {getPainColor(1)}"></div>
        <span>1-3: Mild</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: {getPainColor(5)}"></div>
        <span>4-6: Moderat</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: {getPainColor(9)}"></div>
        <span>7-10: Schwer</span>
      </div>
    </div>
  </div>
</div>

{#if selectedEntry}
  <div class="modal-overlay" onclick={closeDetail}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2>Eintrag vom {new Date(selectedEntry.date).toLocaleDateString('de-DE')}</h2>
      
      <div class="detail-section">
        <strong>Schmerzintensität:</strong>
        <div class="pain-indicator" style="background: {getPainColor(selectedEntry.scale)}">
          {selectedEntry.scale} / 10
        </div>
      </div>

      <div class="detail-section">
        <strong>Schmerzpunkte:</strong>
        <div class="points-info">
          <div>Vorderseite: {selectedEntry.points.front.length} Punkt(e)</div>
          <div>Rückseite: {selectedEntry.points.back.length} Punkt(e)</div>
        </div>
      </div>

      {#if selectedEntry.medication.length > 0}
        <div class="detail-section">
          <strong>Medikamente:</strong>
          <ul>
            {#each selectedEntry.medication as med}
              <li>{med}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if selectedEntry.notes}
        <div class="detail-section">
          <strong>Notizen:</strong>
          <p>{selectedEntry.notes}</p>
        </div>
      {/if}

      <button class="close-button" onclick={closeDetail}>Schließen</button>
    </div>
  </div>
{/if}

<style>
  .history-calendar {
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

  .month-navigator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .month-navigator button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 1.2rem;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }

  .calendar {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .weekday {
    text-align: center;
    font-weight: bold;
    color: #666;
    padding: 0.5rem;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  .day-cell {
    aspect-ratio: 1;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.2s;
  }

  .day-cell:hover {
    transform: scale(1.05);
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .day-cell.other-month {
    opacity: 0.4;
  }

  .day-cell.has-entry {
    border-color: #000;
    border-width: 2px;
  }

  .day-number {
    font-weight: bold;
    color: #333;
  }

  .pain-value {
    font-size: 0.75rem;
    font-weight: bold;
    color: white;
    background: rgba(0,0,0,0.3);
    padding: 0.1rem 0.3rem;
    border-radius: 2px;
    margin-top: 0.2rem;
  }

  .legend {
    margin-top: 1rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .legend h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }

  .legend-items {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-color {
    width: 2rem;
    height: 2rem;
    border: 2px solid #333;
    border-radius: 4px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    margin-top: 0;
    color: #333;
  }

  .detail-section {
    margin: 1rem 0;
  }

  .pain-indicator {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  .points-info {
    margin-top: 0.5rem;
  }

  .detail-section ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .close-button {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #4CAF50;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
  }
</style>
