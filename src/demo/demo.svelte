<script>
  import Sidebar from "./sidebar";
  import { DEMOS } from "./samples";
  let activeDemo = DEMOS.find(demo => demo.type != "category");

  function fromHash() {
    let value = decodeURIComponent(window.location.hash.slice(1));
    let demo = DEMOS.find(
      demo => demo.title === value && demo.type != "category"
    );
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
    margin: 0;
    height: 100vh;
    color: #ffffff;
    background-color: #222222;
  }

  .layout {
    height: 100%;
    display: grid;
    gap: 1em;
    grid-template-columns: 4fr 14fr;
    grid-template-rows: 100%;
  }

  .content {
    padding: 1em;
    display: grid;
    gap: 1em;
    grid-template-rows: auto 1fr;
    overflow: auto;
  }

  .demo-title {
    padding: 1em;

    color: orange;
    font-weight: bold;

    border-bottom: 3px solid orange;
  }

  .source {
    padding-top: 2em;
    font-size: larger;
  }
</style>

<svelte:window on:hashchange={fromHash} />

<div class="layout">
  <Sidebar bind:activeDemo />
  <div class="content">
    <div class="demo-title">{activeDemo.title}</div>
    <div>
      <svelte:component this={activeDemo.sample} />
      <pre class="source">{activeDemo.source}</pre>
    </div>
  </div>
</div>
