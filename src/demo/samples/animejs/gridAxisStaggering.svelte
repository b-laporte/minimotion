<script>
  // cf https://animejs.com/documentation/#gridAxisStaggering
  import Player from "../../player";
  import Grid from "./common/grid";
  import { easeInOutQuad } from "../../../core/easings";

  let xCenter = 6.5;
  let yCenter = 2;

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      const x = index % 14;
      const y = Math.floor(index / 14);
      const xDist = x - xCenter;
      const yDist = y - yCenter;
      const xDistMax = xDist >= 0 ? ((length - 1) % 14) - xCenter : xCenter;
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

<Grid />

<Player {animation} />
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
