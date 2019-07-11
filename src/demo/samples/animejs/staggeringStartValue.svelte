<script>
  // cf https://animejs.com/documentation/#staggeringStartValue
  import Player from "../../player";
  import Column from "./common/column";

  async function animation(a) {
    a.iterate(".square.el", async (a, index) => {
      a.animate({
        translateX: [0, 270],
        delay: 500 + index * 100
      });
    });
  }
</script>

<Column />
<Player {animation} />
