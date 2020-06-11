<script>
  import { Player } from "../core/anim";
  import { tick, onDestroy } from "svelte";

  export let animation;
  export let params = false;

  let player;
  let animDuration = 0;

  export async function reset() {
    const newPlayer = new Player(animation);
    const oldPlayer = player;
    player = newPlayer;
    animDuration = 0;
    if (oldPlayer) {
      await oldPlayer.stop();
    }
    if (player == newPlayer) {
      await tick();
      animDuration = await player.duration();
    }
  }

  $: reset(animation);

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
    if (player.position === animDuration || player.position === 0) {
      await reset();
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
  input[type="range"] {
    width: 100%;
  }

  div.player {
    padding-top: 10px;
    cursor: default;
    font-size: 1rem;
    display: flex;
    align-items: center;
  }

  div.speeds {
    padding-top: 5px;
  }

  .btn {
    font-size: 0.9rem;
    border: 0;
    border-radius: 5px;
    padding: 0.3rem 0.8rem;
    margin: 0.1rem 0.5rem 0.2rem 0;
    background-color: #1670c5;
    color: #ffffff;
  }

  .btn:last-child {
    margin-right: 0;
  }

  .play,
  button.active {
    background-color: #2cf91a;
    color: #111;
  }

  .speeds {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .params {
    margin-top: 1rem;
  }

  .params :global(label) {
    display: inline-flex;
    align-items: center;
    margin-bottom: 0.125rem;
  }

  .params :global(label > input) {
    font-size: 1rem;
    flex: 1;
    margin-right: 1rem;
  }

  .params :global(label > div) {
    width: 125px;
  }

  .params h3 {
    color: #1670c5;
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
  <button class="btn" on:click|preventDefault={pause}>||</button>
  <button class="btn play" on:click|preventDefault={play}>Play</button>
  <button class="btn" on:click|preventDefault={playBack}>&lt;&lt;</button>
  <button class="btn" on:click|preventDefault={stop}>Stop</button>

  <div class="speeds">
    Speed&nbsp;
    <button
      class="btn"
      class:active={speed === 0.1}
      on:click={() => setSpeed(0.1)}>
      &times;0.1
    </button>
    <button
      class="btn"
      class:active={speed === 0.5}
      on:click={() => setSpeed(0.5)}>
      &times;0.5
    </button>

    <button class="btn" class:active={speed === 1} on:click={() => setSpeed(1)}>
      &times;1
    </button>

    <button class="btn" class:active={speed === 2} on:click={() => setSpeed(2)}>
      &times;2
    </button>

    <button class="btn" class:active={speed === 5} on:click={() => setSpeed(5)}>
      &times;5
    </button>
  </div>
</div>
{#if params}
  <div class="params">
    <h3>Parameters</h3>
    <slot>No paramater</slot>
  </div>
{/if}
