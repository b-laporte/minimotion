<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeInOutCubic } from "../../core/easings";

  async function animation(a) {
    a.iterate({ targets: ".square", sequence: true }, a => {
      a.animate({
        left: [0, 500],
        duration: 400,
        easing: easeInOutCubic,
        release: -80
      });
    });
  }
</script>

<CommonSquares />
<Player {animation} />
