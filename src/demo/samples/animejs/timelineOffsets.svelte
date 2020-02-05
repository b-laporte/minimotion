<script>
  // cf https://animejs.com/documentation/#timelineOffsets
  import Player from "../../player";
  import Timeline from "./common/timeline";
  import { easeOutExpo } from "../../../core/easings";

  async function animation(a) {
    a.defaults({ easing: easeOutExpo, duration: 750 });
    a.sequence(async a => {
      await a.animate({
        target: ".el.square",
        translateX: [0, 250],
        release: -300
      });
      a.animate({ target: ".el.circle", translateX: [0, 250] });
    });
    // triangle will run in parallel of the previous sequence
    a.animate({ target: ".el.triangle", translateX: [0, 250] });
  }
</script>

<Timeline />
<Player {animation} />
