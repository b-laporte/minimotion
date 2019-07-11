<script>
  // cf https://animejs.com/documentation/#staggeringFrom
  import Player from "../../player";
  import Column from "./common/column";

  let center = 2.5;

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      a.animate({
        translateX: [0, 270],
        delay: Math.abs(index - center) * 100
      });
    });
  }
</script>

<Column />
<Player {animation} />
<br />
<label>
  Center:
  <input type="number" bind:value={center} />
</label>
