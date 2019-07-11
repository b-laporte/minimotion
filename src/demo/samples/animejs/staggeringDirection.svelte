<script>
  // cf https://animejs.com/documentation/#staggeringDirection
  import Player from "../../player";
  import Column from "./common/column";

  async function animation(a) {
    a.iterate(".square.el", async (a, index, length) => {
      a.animate({
        translateX: [0, 270],
        delay: (length - 1 - index) * 100
      });
    });
  }
</script>

<Column />
<Player {animation} />
