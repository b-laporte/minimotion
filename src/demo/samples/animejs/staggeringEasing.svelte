<script>
  // cf https://animejs.com/documentation/#staggeringEasing
  import Player from "../../player";
  import Column from "./common/column";
  import { easeOutQuad } from "../../../core/easings";

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      let lastIndex = length - 1;
      a.animate({
        translateX: [0, 270],
        delay: 300 * lastIndex * easeOutQuad(index / lastIndex)
      });
    });
  }
</script>

<Column />
<Player {animation} />
