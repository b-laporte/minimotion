<script>
  // cf https://animejs.com/documentation/#propertyKeyframes
  import Player from "../../player";
  import Circle from "./common/circle";
  import { easeOutElastic, easeOutExpo } from "../../../core/easings";

  async function animation(a) {
    a.defaults({
      target: ".circle.el",
      easing: easeOutElastic,
      elasticity: 0.8
    });

    a.set({
      transform: "translateX(0px) translateY(0px) scaleX(1) scaleY(1)"
    });
    
    await move(a, "Y", -40, 500, 1.75, 50);
    await move(a, "X", 250, 1000, 4, 100);
    await move(a, "Y", 40, 500, 2, 50);
    await move(a, "X", 0, 1000, 4, 100);
    await move(a, "Y", 0, 500, 1.75, 50);

    // sub-animation function (could be external & shared as a library)
    async function move(a, xORy, value, duration, scaleMax, scaleMaxTime) {
      a.animate({
        [`translate${xORy}`]: value,
        duration
      });
      await a.animate({
        [`scale${xORy}`]: [1, scaleMax],
        duration: scaleMaxTime,
        easing: easeOutExpo
      });
      await a.animate({
        [`scale${xORy}`]: [scaleMax, 1],
        duration: duration - scaleMaxTime
      });
    }
  }
</script>

<Circle />
<Player {animation} />
