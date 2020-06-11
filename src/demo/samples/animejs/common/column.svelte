<script>
  const lines = [];
  lines.length = 6;
</script>

<style>
  .wrapper {
    padding: 50px;
  }
  .line {
    width: 100%;
    padding: 1px 0px;
  }
  .square {
    margin: 1px;
    width: 22px;
    height: 22px;
    border-radius: 2px;
    background-color: orange;
  }
  .shadow {
    position: absolute;
    opacity: 0.2;
  }
</style>

<div class="wrapper">
  {#each lines as line}
    <div class="line">
      <div class="square shadow" />
      <div class="square el" />
    </div>
  {/each}
</div>
