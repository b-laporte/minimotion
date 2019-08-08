<script>
  // cf https://animejs.com/documentation/#svgAttr
  import Player from "../../player";
  import { easeInOutExpo } from "../../../core/easings";

  async function animation(a) {
    a.defaults({ easing: easeInOutExpo });
    a.animate({
      target: "polygon",
      points: "64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96"
    });
    a.animate({
      target: "feTurbulence",
      baseFrequency: [0.05, 0]
    });
    a.animate({
      target: "feDisplacementMap",
      scale: [15, 1]
    });
  }
</script>

<style>
  .wrapper {
    padding: 50px;
  }
</style>

<div class="wrapper">
  <svg width="128" height="128" viewBox="0 0 128 128">
    <filter id="displacementFilter">
      <feTurbulence
        type="turbulence"
        baseFrequency="0.05"
        numOctaves="2"
        result="turbulence" />
      <feDisplacementMap
        in2="turbulence"
        in="SourceGraphic"
        scale="15"
        xChannelSelector="R"
        yChannelSelector="G" />
    </filter>
    <polygon
      points="64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100"
      style="filter: url(#displacementFilter)"
      fill="#FF8F42" />
  </svg>
</div>
<Player {animation} />
