<script>
  import { DEMOS } from "./samples";
  let currentSampleIndex = 0;

  function fromHash() {
    let value = decodeURIComponent(window.location.hash.slice(1));
    let index = DEMOS.findIndex(demo => demo.title === value);
    if (index > -1) {
      currentSampleIndex = index;
    } else {
      toHash(currentSampleIndex);
    }
  }

  function toHash(sampleIndex) {
    const hash = `#${encodeURIComponent(DEMOS[sampleIndex].title)}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  fromHash();

  $: toHash(currentSampleIndex);
</script>

<style>
  :global(body) {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1;
    padding: 50px;
    color: #ffffff;
    background-color: #222222;
  }

  div.sample-selector {
    margin-bottom: 50px;
  }
</style>

<svelte:window on:hashchange={fromHash} />
<div class="sample-selector">
  <label>
    Select a sample:
    <select bind:value={currentSampleIndex}>
      {#each DEMOS as demo, index}
        <option value={index}>{demo.title}</option>
      {/each}
    </select>
  </label>
</div>

<svelte:component this={DEMOS[currentSampleIndex].sample} />
