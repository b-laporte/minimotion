<script>
  // cf https://animejs.com/documentation/#gridAxisStaggering
  import Player from "../../player";
  import Grid from "./common/grid";
  import { easeInOutQuad } from "../../../core/easings";

  let width = 14;
  let height = 5;
  let xCenter = 6.5;
  let yCenter = 2;

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      const x = index % width;
      const y = Math.floor(index / width);
      const xDist = x - xCenter;
      const yDist = y - yCenter;
      const xDistMax = xDist >= 0 ? ((length - 1) % width) - xCenter : xCenter;
      const dist = Math.sqrt(xDist * xDist + yDist * yDist);
      a.animate({
        delay: dist * 200,
        translateX: [0, 10 * xDist],
        translateY: [0, 10 * yDist],
        rotateZ: [0, (90 * xDist) / xDistMax],
        easing: easeInOutQuad
      });
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
<br />
