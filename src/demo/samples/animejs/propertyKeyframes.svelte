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
      a.animate({
        [`scale${xORy}`]: [scaleMax, 1],
        duration: duration - scaleMaxTime
      });
    }

    a.set({
      transform: "translateX(0px) translateY(0px) scaleX(1) scaleY(1)"
    });
    await a.sequence(
      async a => await move(a, "Y", -40, 500, 1.75, 50),
      async a => await move(a, "X", 250, 1000, 4, 100),
      async a => await move(a, "Y", 40, 500, 2, 50),
      async a => await move(a, "X", 0, 1000, 4, 100),
      async a => await move(a, "Y", 0, 500, 1.75, 50)
    );
  }
</script>

<Circle />
<Player {animation} />
