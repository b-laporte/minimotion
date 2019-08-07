<script>
  // cf https://animejs.com/documentation/#gridStaggering
  import Player from "../../player";
  import Grid from "./common/grid";
  import { easeOutSine, easeInOutQuad } from "../../../core/easings";

  let width = 14;
  let height = 5;
  let xCenter = 6.5;
  let yCenter = 2;
  let nDistance = 2;

  function distanceN(x, y, xCenter, yCenter, n) {
    return Math.pow(
      Math.pow(Math.abs(x - xCenter), n) + Math.pow(Math.abs(y - yCenter), n),
      1 / n
    );
  }

  async function animation(a) {
    a.iterate(".square.el", async (a, index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      const distFromCenter = distanceN(x, y, xCenter, yCenter, nDistance);
      await a.animate({
        scale: [1, 0.1],
        delay: distFromCenter * 200,
        easing: easeOutSine,
        duration: 500
      });
      a.animate({ scale: [0.1, 1], easing: easeInOutQuad, duration: 1200 });
    });
  }
</script>

<Grid {width} {height}/>

<Player {animation} />
<br />
<label>
  Width:
  <input type="number" bind:value={width} />
</label>
<br />
<label>
  Height:
  <input type="number" bind:value={height} />
</label>
<br />
<label>
  Center X:
  <input type="number" bind:value={xCenter} />
</label>
<br />
<label>
  Center Y:
  <input type="number" bind:value={yCenter} />
</label>
<br />
<label>
  Distance power:
  <input type="number" bind:value={nDistance} />
</label>
<br />
