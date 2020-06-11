<style>
  .wrapper {
    padding: 10px 50px 50px;
  }
  .shadow {
    position: absolute;
    opacity: 0.2;
  }
  .line {
    width: 100%;
    padding: 8px 0px;
  }
  .square,
  .circle {
    width: 30px;
    height: 30px;
    margin: 1px;
  }
  .square {
    border-radius: 2px;
    background-color: #2096fe;
  }

  .circle {
    border-radius: 50%;
    background-color: #20fe50;
  }

  .triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 18px 30px 18px;
    border-color: transparent transparent orange transparent;
  }
</style>

<div class="wrapper">
  <div class="line">
    <div class="square shadow" />
    <div class="square el" />
  </div>
  <div class="line">
    <div class="circle shadow" />
    <div class="circle el" />
  </div>
  <div class="line">
    <div class="triangle shadow" />
    <div class="triangle el" />
  </div>
</div>
