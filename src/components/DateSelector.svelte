<script lang="ts">
  import { formatDate, parseDate, addDays } from '../lib/utils';

  interface Props {
    date: string;
    onChange: (date: string) => void;
  }

  let { date = $bindable(''), onChange }: Props = $props();

  function changeDate(days: number) {
    const currentDate = parseDate(date);
    const newDate = addDays(currentDate, days);
    const today = new Date();
    
    // Don't allow navigating to future dates
    if (newDate > today) {
      return;
    }
    
    const formattedDate = formatDate(newDate);
    onChange(formattedDate);
  }

  function handleDateInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onChange(target.value);
  }
</script>

<div class="date-selector">
  <button class="nav-button" onclick={() => changeDate(-1)}>◀</button>
  <input
    type="date"
    value={date}
    oninput={handleDateInput}
    max={formatDate(new Date())}
  />
  <button class="nav-button" onclick={() => changeDate(1)}>▶</button>
</div>

<style>
  .date-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  input[type="date"] {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    text-align: center;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background: #e9e9e9;
    border-color: #999;
  }

  .nav-button:active {
    transform: scale(0.95);
  }
</style>
