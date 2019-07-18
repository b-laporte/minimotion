<script>
  import { DEMOS } from "./samples";

  let filter = '';
  export let activeDemo;

  let filteredDemos = DEMOS;
	function filterDemos(filter) {
    const normalizedFilter = filter.toLowerCase();
    
    filteredDemos = DEMOS.filter(demo => demo.type === 'category' || demo.title.toLowerCase().includes(normalizedFilter));

    filteredDemos = filteredDemos.filter((demo, index) => {
      if (demo.type !== 'category') { return true; }

      const nextItem = filteredDemos[index + 1];
      if (nextItem == null || nextItem.type === 'category') {return false;}
      return true;
    });
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

  .message {
    color: #856404;
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    padding: 1em;
    border-radius: 0.25em;
    font-weight: bold;
  }

  .category {
    padding: 1em;

    text-align: center;
    font-weight: bold;

    border-radius: 0.25em;
    box-shadow: -5px 0 2px 0 indianred;
    margin: 0.25em 0.75em;

    background: white;
    color: black;

    transform: skewX(-10deg);
  }

  .demo-list {
    align-self: start;
    padding-right: 0.25em;
    
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: 1fr;

    max-height: 100%;
    overflow-y: scroll;
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

  {#if filteredDemos.length === 0}
    <div class="message">No matching demo!</div>
  {:else}
    <div class="demo-list">
      {#each filteredDemos as item}
        {#if item.type === 'category'}
          <div class="category">{item.title}</div>
        {:else}
          <div
            class="demo"
            class:active={item === activeDemo}
            on:click={() => onDemoClick(item)}
            on:keydown={event => onDemoKeydown(event, item)}
            tabindex="0"
          >
            {item.title}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
