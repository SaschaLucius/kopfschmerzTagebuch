<script lang="ts">
  import MainEntry from './components/MainEntry.svelte';
  import HistoryCalendar from './components/HistoryCalendar.svelte';
  import Analytics from './components/Analytics.svelte';

  let currentView = $state<'main' | 'history' | 'analytics'>('main');

  function navigate(view: 'main' | 'history' | 'analytics') {
    currentView = view;
  }
</script>

<main>
  {#if currentView === 'main'}
    <MainEntry onNavigate={navigate} />
  {:else if currentView === 'history'}
    <HistoryCalendar onNavigate={navigate} />
  {:else if currentView === 'analytics'}
    <Analytics onNavigate={navigate} />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #f5f5f5;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
  }
</style>
