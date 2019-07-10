<script>
  import { Player } from "../core/anim";
  import { tick, onDestroy } from "svelte";

  export let animation;

  const player = new Player(animation);
  let animDuration = 0;
  (async function() {
    await tick();
    animDuration = await player.duration();
  })();

  let speed = 1;
  let progression = 0;

  function onupdate() {
    if (animDuration) {
      progression = Math.trunc((1000 * player.position) / animDuration);
    }
  }

  function setPosition() {
    if (animDuration) {
      player.move((animDuration * progression) / 1000);
    }
  }

  function setSpeed(newSpeed) {
    pause();
    speed = newSpeed;
  }

  async function play() {
    if (player.position === animDuration) {
      await player.move(0);
    }
    player.play({ speed, onupdate });
  }

  function pause() {
    player.pause();
  }

  async function playBack() {
    if (player.position === 0) {
      await player.move(animDuration);
    }
    player.play({
      speed,
      onupdate,
      forward: false
    });
  }

  async function stop() {
    await player.stop();
    onupdate();
  }

  onDestroy(stop);
</script>

<style>
  a {
    color: #ffffff;
  }

  a.active {
    color: #2cf91a;
  }

  input[type="range"] {
    width: 530px;
  }

  div.player {
    padding-top: 10px;
  }

  div.speeds {
    padding-top: 5px;
  }
</style>

<input
  type="range"
  min="0"
  max="1000"
  bind:value={progression}
  on:input={setPosition}
  step="1" />
<div class="player">
  <a href="#" on:click|preventDefault={play}>Play</a>
  |
  <a href="#" on:click|preventDefault={pause}>Pause</a>
  |
  <a href="#" on:click|preventDefault={playBack}>Play back</a>
  |
  <a href="#" on:click|preventDefault={stop}>Stop</a>
</div>
<div class="speeds">
  Speed:
  <a
    href="#"
    class:active={speed === 0.5}
    on:click|preventDefault={() => setSpeed(0.5)}>
    x0.5
  </a>
  |
  <a
    href="#"
    class:active={speed === 1}
    on:click|preventDefault={() => setSpeed(1)}>
    x1
  </a>
  |
  <a
    href="#"
    class:active={speed === 2}
    on:click|preventDefault={() => setSpeed(2)}>
    x2
  </a>
  |
  <a
    href="#"
    class:active={speed === 5}
    on:click|preventDefault={() => setSpeed(5)}>
    x5
  </a>
</div>
