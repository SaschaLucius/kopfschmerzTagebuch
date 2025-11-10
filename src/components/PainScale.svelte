<script lang="ts">
  import { getPainColor } from '../lib/utils';

  interface Props {
    value: number;
    onChange: (value: number) => void;
  }

  let { value = $bindable(0), onChange }: Props = $props();

  function handleScaleClick(scale: number) {
    value = scale;
    onChange(scale);
  }
</script>

<div class="pain-scale">
  <h3>Schmerzintensität (1-10)</h3>
  <div class="scale-container">
    {#each Array(10) as _, i}
      <button
        class="scale-button"
        class:selected={value === i + 1}
        style="background-color: {value === i + 1 ? getPainColor(i + 1) : '#f0f0f0'}"
        onclick={() => handleScaleClick(i + 1)}
      >
        {i + 1}
      </button>
    {/each}
  </div>
  <div class="scale-labels">
    <span>Mild</span>
    <span>Moderat</span>
    <span>Schwer</span>
  </div>
</div>

<style>
  .pain-scale {
    margin: 1rem 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }

  .scale-container {
    display: flex;
    gap: 0.3rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .scale-button {
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    color: #333;
  }

  .scale-button:hover {
    transform: scale(1.1);
    border-color: #666;
  }

  .scale-button.selected {
    border-color: #000;
    border-width: 3px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }
</style>
