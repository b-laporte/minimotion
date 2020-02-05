<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeOutElastic } from "../../core/easings";

  async function animation(a) {
    a.play({ alternate: true, times: 3, backSpeed: 2 }, a => {
      a.iterate(".square", (a, idx) => {
        a.animate({
          left: [0, 500],
          backgroundColor: "#F00",
          borderRadius: [0, "25px"],
          duration: 1600,
          easing: easeOutElastic,
          elasticity: 0.3,
          delay: idx * 40
        });
      });
    });
  }
</script>

<CommonSquares />
<Player {animation} />
