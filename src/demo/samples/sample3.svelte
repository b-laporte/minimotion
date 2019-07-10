<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeInOutCubic } from "../../core/easings";

  async function animation(a) {
    a.iterate(".square", (a, idx) => {
      a.animate({
        left: [0, 500],
        duration: 100,
        easing: easeInOutCubic,
        delay: idx * 40
      });
    });
  }
</script>

<CommonSquares />
<Player {animation} />
