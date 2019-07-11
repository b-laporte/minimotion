<script>
  // cf https://animejs.com/documentation/#staggeringBasics
  import Player from "../../player";
  import Column from "./common/column";

  async function animation(a) {
    a.iterate(".square.el", async (a, index) => {
      a.animate({
        translateX: [0, 270],
        delay: index * 100
      });
    });
  }
</script>

<Column />
<Player {animation} />
