<script>
  // cf https://animejs.com/documentation/#TLParamsInheritance
  import Player from "../../player";
  import Timeline from "./common/timeline";
  import { easeOutExpo } from "../../../core/easings";

  async function animation(a) {
    a.defaults({ easing: easeOutExpo, duration: 500 });
    await a.iterate(".el", async function(a, index) {
      await a.animate({
        delay: index * 200,
        translateX: [0, 250]
        /* TODO: easing: spring */
      });
    });
    await a.iterate(".el", async function(a, index) {
      await a.animate({
        delay: index * 200,
        opacity: [1, 0.5],
        scale: [1, 2]
      });
    });
    await a.animate({ target: ".el.triangle", rotate: [0, 180] });
    await a.iterate(".el", async function(a, index) {
      await a.animate({
        delay: index * 200,
        translateX: [250, 0],
        scale: [2, 1]
      });
    });
  }
</script>

<Timeline />
<Player {animation} />
