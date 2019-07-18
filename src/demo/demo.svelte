<script>
  import Sidebar from "./sidebar";
  import { DEMOS } from "./samples";
  let activeDemo = DEMOS[0];

  function fromHash() {
    let value = decodeURIComponent(window.location.hash.slice(1));
    let demo = DEMOS.find(demo => demo.title === value);
    if (demo != null) {
      activeDemo = demo;
    } else {
      toHash(activeDemo);
    }
  }

  function toHash(demo) {
    const hash = `#${encodeURIComponent(demo.title)}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  fromHash();

  $: toHash(activeDemo);
</script>

<style>
  :global(body) {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1;
    /* padding: 50px; */
    margin: 0;
    height: 100vh;
    width: 100vw;
    color: #ffffff;
    background-color: #222222;
  }

  .layout {
    display: grid;
    grid-template-columns: 3fr 14fr;
    gap: 1em;
    height: 100%;
  }

  .content {
    padding: 1em;
  }
</style>

<svelte:window on:hashchange={fromHash} />

<div class="layout">
  <Sidebar bind:activeDemo />
  <div class="content">
    <svelte:component this={activeDemo.sample} />
  </div>
</div>
