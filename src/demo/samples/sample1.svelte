<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeInOutCubic, linear } from "../../core/easings";

  async function animation(a) {
    a.defaults({ duration: 400, easing: easeInOutCubic });
    await a.animate({ target: ".square1", left: [0, 500], release: -200 });
    await a.animate({
      target: ".square2",
      left: [0, 500],
      release: -100,
      easing: linear
    });
    a.animate({ target: ".square3", left: [0, 500] });
  }
</script>

<CommonSquares />
<Player {animation} />
