<script>
  const rects = [];
  rects.length = 14 * 5;
</script>

<style>
  .wrapper {
    padding: 50px;
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 290px;
    height: 100%;
  }
  .grid {
    display: flex;
    flex-wrap: wrap;
  }
  .square {
    margin: 1px;
    width: 18px;
    height: 18px;
    background-color: #00d672;
  }
  .shadow {
    position: absolute;
    opacity: 0.2;
  }
</style>

<div class="wrapper">
  <div class="content">
    <div class="grid">
      {#each rects as rect}
        <div class="square el" />
      {/each}
    </div>
    <div class="grid shadow">
      {#each rects as rect}
        <div class="square" />
      {/each}
    </div>
  </div>
</div>
