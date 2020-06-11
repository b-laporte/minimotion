<script>
  import "prismjs/themes/prism-dark.css";

  import Sidebar from "./sidebar";
  import Home from "./home";
  import { DEMOS } from "./samples";
  let firstDemo = DEMOS.find(demo => demo.type != "category");
  let activeDemo;

  function fromHash() {
    let value = decodeURIComponent(window.location.hash.slice(2));
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
    const hash = demo ? `#/${encodeURIComponent(demo.title)}` : "#/";
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  fromHash();
  $: if (activeDemo) {
    toHash(activeDemo);
  }
  $: notes = activeDemo && activeDemo.animejs;
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
    gap: 2rem;
    grid-template-columns: 5fr 14fr;
    grid-template-rows: 100%;
  }

  .demo-title {
    box-sizing: border-box;
    background-color: #2096fe;
    display: flex;
    align-items: center;
    padding: 0 2rem 0.25rem;
    margin-left: -2rem;
    font-size: 3rem;
    height: 7.5rem;
  }

  .panel {
    margin-top: 2rem;
    margin-right: 2rem;
  }

  .demo {
    padding: 1rem;
    background-color: #2a2a2a;
  }

  .demo > h3 {
    margin-top: 0;
  }

  h3 {
    color: #2096fe;
  }

  .notes {
    color: #888;
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .animejs a {
    color: inherit;
  }

  .sources {
    margin-top: 2rem;
    padding: 0 1rem;
  }

  pre.code {
    white-space: pre-wrap;
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

{#if activeDemo}
  <div class="layout">
    <Sidebar bind:activeDemo />
    <div class="content">
      <div class="demo-title">{activeDemo.title}</div>
      <div class="panel">
        <div class="demo">
          <h3>Live Preview</h3>
          <svelte:component this={activeDemo.sample} />
        </div>

        <div class="sources">
          <h3>Sources</h3>
          <pre class="code">
            <code class="typescript">
              {@html activeDemo.source}
            </code>
          </pre>
        </div>

        {#if notes}
          <div class="notes">
            <h3>Notes</h3>
            {#if activeDemo.animejs}
              <div class="animejs">
                This demo is a minimotion rewrite of
                <a
                  href={`https://animejs.com/documentation/#${activeDemo.animejs}`}
                  target="_blank"
                  rel="noopener no-referer">
                  an animejs example.
                </a>
                Same markup is re-used for the sole purpose of comparison.
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <Home on:click={() => (activeDemo = firstDemo)} />
{/if}
