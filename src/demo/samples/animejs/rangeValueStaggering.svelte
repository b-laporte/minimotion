<script>
  // cf https://animejs.com/documentation/#rangeValueStaggering
  import Player from "../../player";
  import Column from "./common/column";
  import { easeInOutQuad } from "../../../core/easings";

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      const rotationEnd = -360 + ((360 + 360) * index) / (length - 1);
      a.animate({
        translateX: [0, 270],
        rotate: [0, rotationEnd],
        easing: easeInOutQuad
      });
    });
  }
</script>

<Column />
<Player {animation} />
