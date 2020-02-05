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
    width: 18px;
    height: 18px;
    background-color: #20fe50;
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
