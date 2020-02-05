<script>
  import "prismjs/themes/prism-dark.css";

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
    padding: 0;
    font-size: 15px;
    font-family: "Open Sans", Verdana, Arial, Helvetica, sans-serif;
    font-weight: 300;
    background-color: #333;
    color: #fff;
    margin: 0;
  }

  .layout {
    height: 100%;
    display: grid;
    gap: 2em;
    grid-template-columns: 4fr 14fr;
    grid-template-rows: 100%;
  }

  .content {
    padding: 1em;
  }

  .panel {
    margin-top: 3rem;
  }

  .demo-title {
    padding-top: 1.1rem;
    font-size: 3rem;
  }

  pre.code {
    margin-top: 3rem;
  }

  code.typescript {
    font-family: "Roboto Mono", "Courier New", Courier, monospace;
    font-weight: 300;
    line-height: 1.3rem;
    font-size: 1rem;
    color: rgb(206, 213, 252);
    cursor: default;
  }

  :global(span.token.keyword) {
    color: rgb(142, 164, 252);
  }

  :global(span.token.function) {
    color: rgb(237, 151, 254);
  }

  :global(span.token.parameter) {
    color: rgb(255, 242, 95);
  }

  :global(span.token.punctuation) {
    color: rgb(191, 189, 189);
  }

  :global(span.token.number) {
    color: rgb(130, 255, 130);
  }

  :global(span.token.string) {
    color: rgb(255, 171, 97);
  }

  :global(span.token.comment) {
    color: rgb(134, 155, 131);
  }
</style>

<svelte:window on:hashchange={fromHash} />

<div class="layout">
  <Sidebar bind:activeDemo />
  <div class="content">
    <div class="demo-title">{activeDemo.title}</div>
    <div class="panel">
      <svelte:component this={activeDemo.sample} />
      <pre class="code">
        <code class="typescript">
          {@html activeDemo.source}
        </code>
      </pre>
    </div>
  </div>
</div>
