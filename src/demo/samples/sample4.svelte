<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeInCubic, easeOutBack, easeOutCubic } from "../../core/easings";

  async function animation(a) {
    a.iterate({ targets: ".square" }, async (a, idx) => {
      await a.animate({
        delay: idx * 100,
        left: [0, 300],
        duration: 400,
        easing: easeInCubic
      });
      await a.animate({ left: [300, 100], duration: 200, easing: easeOutBack });
      a.animate({ left: [100, 500], duration: 400, easing: easeOutCubic });
    });
  }
</script>

<CommonSquares />
<Player {animation} />
