<script>
  import Player from "../player";
  import CommonSquares from "./commonSquares";
  import { easeInOutCubic } from "../../core/easings";

  async function animation(a) {
    a.defaults({ easing: easeInOutCubic, release: -750 });
    await a.animate({
      target: ".square1",
      transform: [
        "translateX(0) rotate(0) translateX(0)",
        `translateX(450px) rotate(90deg) translateX(160px)`
      ]
    });
    await a.animate({
      target: ".square2",
      transform: [
        "translateX(0) rotate(0) translateX(0)",
        `translateX(400px) rotate(90deg) translateX(110px)`
      ]
    });
    await a.animate({
      target: ".square3",
      transform: [
        "translateX(0) rotate(0) translateX(0)",
        `translateX(350px) rotate(90deg) translateX(60px)`
      ]
    });
  }
</script>

<CommonSquares />
<Player {animation} />
