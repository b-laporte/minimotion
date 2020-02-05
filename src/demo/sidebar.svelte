<script>
  import { DEMOS } from "./samples";

  let filter = "";
  export let activeDemo;

  let filteredDemos = DEMOS;
  function filterDemos(filter) {
    const normalizedFilter = filter.toLowerCase();

    filteredDemos = DEMOS.filter(
      demo =>
        demo.type === "category" ||
        demo.title.toLowerCase().includes(normalizedFilter)
    );

    filteredDemos = filteredDemos.filter((demo, index) => {
      if (demo.type !== "category") {
        return true;
      }

      const nextItem = filteredDemos[index + 1];
      if (nextItem == null || nextItem.type === "category") {
        return false;
      }
      return true;
    });
  }

  function onDemoClick(demo) {
    activeDemo = demo;
  }

  function onDemoKeydown(event, demo) {
    if (["enter", " "].includes(event.key.toLowerCase())) {
      activeDemo = demo;
      event.preventDefault();
    }
  }

  function onInputKeydown(event) {
    if (event.key === "Escape") {
      filter = "";
      event.stopPropagation();
      event.preventDefault();
    }
  }

  $: filterDemos(filter);
</script>

<style>
  .sidebar {
    padding: 1em;
    background-color: #2a2a2a;
    height: 100vh;
  }

  .logo {
    font-size: 4rem;
    color: #555;
    padding-left: 2rem;
  }

  .filter {
    height: 2em;
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
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: rgb(99, 172, 249);
  }

  .demo-list {
    font-size: 1rem;
    margin-top: 2rem;
    padding: 0 4rem 0 2rem;
    cursor: default;
  }

  .demo {
    cursor: default;
  }

  .demo:hover {
    color: orange;
    cursor: pointer;
  }

  .demo.active {
    color: orange;
    cursor: default;
  }
</style>

<div class="sidebar">
  <div class="logo">minimotion</div>
  <!-- <input
		type="text"
		class="filter"
		bind:value={filter}
		on:keydown={onInputKeydown}
	/> -->

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
        >
          {item.title}
        </div>
      {/if}
    {/each}
  </div>
</div>
