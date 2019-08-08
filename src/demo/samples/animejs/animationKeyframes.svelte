<script>
  // cf https://animejs.com/documentation/#animationKeyframes
  import Player from "../../player";
  import Circle from "./common/circle";
  import { easeOutElastic } from "../../../core/easings";

  async function animation(a) {
    a.defaults({
      target: ".circle.el",
      duration: 800,
      easing: easeOutElastic,
      elasticity: 0.8
    });
    await a.animate({ translateY: -40 });
    await a.animate({ translateX: 250 });
    await a.animate({ translateY: 40 });
    await a.animate({ translateX: 0 });
    await a.animate({ translateY: 0 });
  }
</script>

<Circle />
<Player {animation} />
