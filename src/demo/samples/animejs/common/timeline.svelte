<style>
  .wrapper {
    padding: 50px;
  }
  .shadow {
    position: absolute;
    opacity: 0.2;
  }
  .line {
    width: 100%;
    padding: 1px 0px;
  }
  .square,
  .circle {
    width: 28px;
    height: 28px;
    margin: 1px;
    background-color: #3cffec;
  }
  .circle {
    border-radius: 50%;
  }
  .triangle {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 14px 24px 14px;
    border-color: transparent transparent #3cffec transparent;
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
