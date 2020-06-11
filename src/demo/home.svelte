<script>
  import { onMount } from "svelte";
  import { Player, linear, easeInOutSine, bezier } from "../core";
  import Logo from "./logo";

  let shake;

  const animation = new Player(async a => {
    a.defaults({ target: ".homepage svg", easing: linear });
    await a.animate({
      duration: 2000,
      delay: 2000,
      strokeWidth: [0, 1],
      fill: ["#ffffff", "#333333"]
    });

    await a.animate({
      duration: 6000,
      strokeDashoffset: [0, 194]
    });

    a.set({
      fill: "#ffffff",
      opacity: 0
    });

    await a.animate({
      duration: 1000,
      easing: easeInOutSine,
      opacity: [0, 1]
    });
  });

  onMount(() => {
    animation.play();
  });

  function startShaking() {
    if (shake) {
      shake.stop();
    }
    shake = new Player(async a => {
      a.defaults({
        duration: 20,
        target: ".logo",
        easing: bezier(0.36, 0.07, 0.19, 0.97)
      });
      a.repeat(4, async (a, count) => {
        const max = (3 - count) * 8;
        await a.animate({
          translateX: [0, max * -1]
        });
        await a.animate({
          translateX: [max * -1, max]
        });
        await a.animate({
          translateX: [max, max / -2]
        });
        await a.animate({
          translateX: [max / -2, max / 2]
        });
        await a.set({
          translateX: [max / 2, 0]
        });
      });
    });
    shake.play();
  }

  async function stopShaking() {
    if (shake && shake.isPlaying) {
      shake.stop();
    }
  }
</script>

<style>
  .homepage {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    width: 400px;
    text-align: center;
  }

  a {
    display: inline-block;
    font-size: 1.5rem;
    border-radius: 5px;
    background-color: #1670c5;
    border: none;
    color: #fff;
    padding: 0.5rem 2rem;
    text-decoration: none;
  }

  .homepage :global(svg) {
    color: #ffffff;
    stroke-width: 0;
    stroke: white;
    stroke-dasharray: 194;
  }

  .logo {
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
</style>

<div class="homepage">
  <div class="content">
    <div class="logo" on:mouseenter={startShaking} on:mouseleave={stopShaking}>
      <Logo />
    </div>
    <p>Web aminations in JavaScript made simple.</p>
    <p>
      <a href="#/" on:click|preventDefault>Demos</a>
      <a
        href="https://github.com/AmadeusITGroup/minimotion"
        target="_blank"
        rel="noopener noreferer">
        GitHub
      </a>
    </p>
  </div>
</div>
