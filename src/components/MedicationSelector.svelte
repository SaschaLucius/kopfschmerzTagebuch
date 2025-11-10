<script lang="ts">
  interface Props {
    medications: string[];
    onChange: (medications: string[]) => void;
  }

  let { medications = $bindable([]), onChange }: Props = $props();

  const commonMedications = [
    'Ibuprofen 400mg',
    'Ibuprofen 600mg',
    'Paracetamol 500mg',
    'Paracetamol 1000mg',
    'Aspirin 500mg',
    'Sumatriptan 50mg',
    'Sumatriptan 100mg',
    'Keine'
  ];

  let customMedication = $state('');
  let showCustomInput = $state(false);

  function toggleMedication(med: string) {
    if (med === 'Keine') {
      medications = [];
      onChange([]);
      return;
    }

    const index = medications.indexOf(med);
    if (index > -1) {
      const newMeds = medications.filter(m => m !== med);
      medications = newMeds;
      onChange(newMeds);
    } else {
      const newMeds = [...medications, med];
      medications = newMeds;
      onChange(newMeds);
    }
  }

  function addCustomMedication() {
    if (customMedication.trim()) {
      const newMeds = [...medications, customMedication.trim()];
      medications = newMeds;
      onChange(newMeds);
      customMedication = '';
      showCustomInput = false;
    }
  }
</script>

<div class="medication-selector">
  <h3>Medikamente</h3>
  <div class="medications-grid">
    {#each commonMedications as med}
      <button
        class="med-button"
        class:selected={medications.includes(med) || (med === 'Keine' && medications.length === 0)}
        onclick={() => toggleMedication(med)}
      >
        {med}
      </button>
    {/each}
  </div>
  
  {#if showCustomInput}
    <div class="custom-input">
      <input
        type="text"
        bind:value={customMedication}
        placeholder="Eigenes Medikament..."
        onkeydown={(e) => e.key === 'Enter' && addCustomMedication()}
      />
      <button onclick={addCustomMedication}>Hinzufügen</button>
      <button onclick={() => showCustomInput = false}>Abbrechen</button>
    </div>
  {:else}
    <button class="add-custom-button" onclick={() => showCustomInput = true}>
      + Eigenes Medikament
    </button>
  {/if}

  {#if medications.length > 0}
    <div class="selected-meds">
      <strong>Ausgewählt:</strong>
      {#each medications as med}
        <span class="selected-med-tag">
          {med}
          <button class="remove-tag" onclick={() => toggleMedication(med)}>×</button>
        </span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .medication-selector {
    margin: 1rem 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }

  .medications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .med-button {
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .med-button:hover {
    background: #e9e9e9;
    border-color: #999;
  }

  .med-button.selected {
    background: #4CAF50;
    color: white;
    border-color: #45a049;
  }

  .add-custom-button {
    width: 100%;
    padding: 0.5rem;
    border: 2px dashed #999;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    color: #666;
    font-size: 0.875rem;
  }

  .add-custom-button:hover {
    border-color: #666;
    color: #333;
  }

  .custom-input {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .custom-input input {
    flex: 1;
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .custom-input button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: #4CAF50;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .custom-input button:last-child {
    background: #999;
  }

  .selected-meds {
    margin-top: 1rem;
    padding: 0.5rem;
    background: #f0f0f0;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .selected-med-tag {
    display: inline-block;
    margin: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
  }

  .remove-tag {
    margin-left: 0.25rem;
    padding: 0 0.25rem;
    border: none;
    background: transparent;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
  }
</style>
