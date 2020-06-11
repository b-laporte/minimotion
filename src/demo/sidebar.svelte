<script>
  import { DEMOS } from "./samples";
  import Logo from "./logo";

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

  function navigate(demo) {
    activeDemo = demo;
  }

  $: filterDemos(filter);
</script>

<style>
  .sidebar {
    background-color: #2a2a2a;
    min-height: 100vh;
  }

  .logo {
    background-color: #1567b0;
    color: white;
    height: 7.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo :global(svg) {
    height: calc(100% - 2rem);
    max-width: calc(100% - 2rem);
  }

  .category {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: rgb(99, 172, 249);
    text-transform: capitalize;
  }

  .category:not(:first-child) {
    margin-top: 2rem;
  }

  .demo-list {
    font-size: 1rem;
    margin: 2rem 0;
    padding: 0 4rem 0 2rem;
    cursor: default;
  }

  .demo {
    cursor: default;
    text-indent: -1rem;
    margin: 0.25rem 0 0.25rem 1rem;
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
  <a href="/" class="logo" on:click={() => navigate(null)}>
    <Logo />
  </a>
  <div class="demo-list">
    {#each filteredDemos as item}
      {#if item.type === 'category'}
        <div class="category">{item.title}</div>
      {:else}
        <div
          class="demo"
          class:active={item === activeDemo}
          on:click={() => navigate(item)}>
          {item.title}
        </div>
      {/if}
    {/each}
  </div>
</div>
