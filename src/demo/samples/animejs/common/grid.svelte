<script>
  export let width = 14;
  export let height = 5;

  function createArray(size) {
    const result = [];
    result.length = size;
    return result;
  }

  $: widthArray = createArray(width);
  $: heightArray = createArray(height);
</script>

<style>
  .wrapper {
    margin: 50px;
    position: relative;
  }
  .square {
    position: absolute;
    width: 18px;
    height: 18px;
    background-color: #00d672;
  }
  .shadow {
    opacity: 0.2;
  }
</style>

<div class="wrapper" style="width: {width * 20 + 2}px; height: {height * 20 + 2}px;">
  <div class="grid">
    {#each heightArray as yItem, y}
      {#each widthArray as xItem, x}
        <div class="square el" style="left: {x * 20 + 1}px; top: {y * 20 + 1}px;" />
      {/each}
    {/each}
  </div>
  <div class="grid shadow">
    {#each heightArray as yItem, y}
      {#each widthArray as xItem, x}
        <div class="square" style="left: {x * 20 + 1}px; top: {y * 20 + 1}px;" />
      {/each}
    {/each}
  </div>
</div>
