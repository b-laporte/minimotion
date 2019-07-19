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

    a.sequence(
      async a => {
        // a.setStyle;
        a.animate({ translateY: [0, -40], duration: 500 });
        a.animate({ scaleY: [1.75, 1], duration: 500 });
      },
      async a => {
        a.group(async a => {
          await a.animate({
            scaleX: [1, 4],
            duration: 100,
            easing: easeOutExpo
          });
          a.animate({ scaleX: [4, 1], duration: 900 });
        });
        a.animate({ translateX: [0, 250], duration: 1000 });
      },
      async a => {
        a.animate({ translateY: [-40, 40], duration: 500 });
      },
      async a => {
        a.animate({ translateX: [250, 0], duration: 1000 });
      },
      async a => {
        a.animate({ translateY: [40, 0], duration: 500 });
      }
    );

    // a.parallelize(
    //   async function() {
    //
    //
    //   },
    //
    //   },
    //   async function() {
    //     await
    //     await a.animate({ scaleX: [4, 1], duration: 900 });
    //     await a.animate({
    //       scaleX: [1, 4],
    //       duration: 100,
    //       delay: 500,
    //       easing: easeOutExpo
    //     });
    //     await a.animate({ scaleX: [4, 1], duration: 900 });
    //   },
    //   async function() {
    //     await a.animate({ scaleY: [1.75, 1], duration: 500 });
    //     
    //     await a.animate({
    //       scaleY: [1, 1.75],
    //       duration: 50,
    //       delay: 1000,
    //       easing: easeOutExpo
    //     });
    //     await a.animate({ scaleY: [1.75, 1], duration: 450 });
    //   }
    // );
  }
</script>

<Circle />
<Player {animation} />
