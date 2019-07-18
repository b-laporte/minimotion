<script>
  import { DEMOS } from "./samples";

  export let activeDemo;
</script>

<style>
  .sidebar {
    align-self: start;
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: 1fr;
    align-items: center;

    max-height: 100%;
    overflow: auto;
  }

  .sample {
    padding: 1em;
    text-align: center;
    cursor: pointer;
  }

  .sample:hover {
    background: lightgrey;
  }

  .sample.active {
    background: aliceblue;
    color: orange;
    cursor: initial;
  }

  .sample.active:hover {
    background: lightblue;
  }
</style>

<div class="sidebar">
	{#each DEMOS as demo}
		<div
			class="sample"
			class:active={demo === activeDemo}
			on:click={() => activeDemo = demo}
		>
			{demo.title}
		</div>
	{/each}
</div>
