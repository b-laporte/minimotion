<script>
  // cf https://animejs.com/documentation/#timelineBasics
  import Player from "../../player";
  import Timeline from "./common/timeline";
  import { easeOutExpo } from "../../../core/easings";

  async function animation(a) {
    a.defaults({ easing: easeOutExpo, duration: 750 });
    await a.animate({ target: ".el.square", translateX: [0, 250] });
    await a.animate({ target: ".el.circle", translateX: [0, 250] });
    await a.animate({ target: ".el.triangle", translateX: [0, 250] });
  }
</script>

<Timeline />
<Player {animation} />
