<script>
  import { DEMOS } from "./samples";

  let filter = '';
  export let activeDemo;

  let filteredDemos = DEMOS;
	function filterDemos(filter) {
    const normalizedFilter = filter.toLowerCase();
    filteredDemos = DEMOS.filter(demo => demo.title.toLowerCase().includes(normalizedFilter));
  }

  function onDemoClick(demo) {
    activeDemo = demo;
  }

  function onDemoKeydown(event, demo) {
    if (['enter', ' '].includes(event.key.toLowerCase())) {
      activeDemo = demo;
      event.preventDefault();
    }
  }

  function onInputKeydown(event) {
    if (event.key === 'Escape') {
      filter = '';
      event.stopPropagation();
      event.preventDefault();
    }
  }

  $: filterDemos(filter);
</script>

<style>
  .sidebar {
    padding: 1em;
    display: grid;
    gap: 1em;
    grid-auto-flow: row;
    align-content: start;
  }

  .filter {
    height: 2em;
    border-radius: 0.25em;
    text-align: center;
  }

  .demo-list {
    align-self: start;
    
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: 1fr;

    max-height: 100%;
    overflow: auto;
  }

  .demo {
    padding: 1em;
    cursor: pointer;
    border-radius: 0.25em;
    text-align: center;
    display: grid;
    align-items: center;
  }

  .demo:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .demo.active {
    color: orange;
    border-bottom: 3px solid orange;
    cursor: initial;
  }
</style>

<div class="sidebar">
	<input
		type="text"
		class="filter"
		bind:value={filter}
		on:keydown={onInputKeydown}
	/>

  <div class="demo-list">
    {#each filteredDemos as demo}
      <div
        class="demo"
        class:active={demo === activeDemo}
        on:click={() => onDemoClick(demo)}
        on:keydown={event => onDemoKeydown(event, demo)}
        tabindex="0"
      >
        {demo.title}
      </div>
    {/each}
  </div>
</div>
