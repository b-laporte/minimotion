import sample1 from "./sample1.svelte";
import sample1Src from "source:./sample1.svelte";
import sample2 from "./sample2.svelte";
import sample2Src from "source:./sample2.svelte";
import sample3 from "./sample3.svelte";
import sample3Src from "source:./sample3.svelte";
import sample4 from "./sample4.svelte";
import sample4Src from "source:./sample4.svelte";
import sample5 from "./sample5.svelte";
import sample5Src from "source:./sample5.svelte";
import transformChain from "./transformChain.svelte";
import transformChainSrc from "source:./transformChain.svelte";
import applyProperties from "./applyProperties.svelte";
import applyPropertiesSrc from "source:./applyProperties.svelte";
import svgAttr from "./animejs/svgAttr.svelte";
import svgAttrSrc from "source:./animejs/svgAttr.svelte";
import animationKeyframes from "./animejs/animationKeyframes.svelte";
import animationKeyframesSrc from "source:./animejs/animationKeyframes.svelte";
import propertyKeyframes from "./animejs/propertyKeyframes.svelte";
import propertyKeyframesSrc from "source:./animejs/propertyKeyframes.svelte";
import staggeringBasics from "./animejs/staggeringBasics.svelte";
import staggeringBasicsSrc from "source:./animejs/staggeringBasics.svelte";
import staggeringStartValue from "./animejs/staggeringStartValue.svelte";
import staggeringStartValueSrc from "source:./animejs/staggeringStartValue.svelte";
import rangeValueStaggering from "./animejs/rangeValueStaggering.svelte";
import rangeValueStaggeringSrc from "source:./animejs/rangeValueStaggering.svelte";
import staggeringFrom from "./animejs/staggeringFrom.svelte";
import staggeringFromSrc from "source:./animejs/staggeringFrom.svelte";
import staggeringDirection from "./animejs/staggeringDirection.svelte";
import staggeringDirectionSrc from "source:./animejs/staggeringDirection.svelte";
import staggeringEasing from "./animejs/staggeringEasing.svelte";
import staggeringEasingSrc from "source:./animejs/staggeringEasing.svelte";
import gridStaggering from "./animejs/gridStaggering.svelte";
import gridStaggeringSrc from "source:./animejs/gridStaggering.svelte";
import gridAxisStaggering from "./animejs/gridAxisStaggering.svelte";
import gridAxisStaggeringSrc from "source:./animejs/gridAxisStaggering.svelte";
import timelineBasics from "./animejs/timelineBasics.svelte";
import timelineBasicsSrc from "source:./animejs/timelineBasics.svelte";
import timelineOffsets from "./animejs/timelineOffsets.svelte";
import timelineOffsetsSrc from "source:./animejs/timelineOffsets.svelte";
import TLParamsInheritance from "./animejs/TLParamsInheritance.svelte";
import TLParamsInheritanceSrc from "source:./animejs/TLParamsInheritance.svelte";
import morphing from "./animejs/morphing.svelte";
import morphingSrc from "source:./animejs/morphing.svelte";

export const DEMOS = [
    {
        type: "category",
        title: "basics"
    },
    {
        title: "simple sequence",
        sample: timelineBasics,
        source: timelineBasicsSrc,
        animejs:  "timelineBasics",
    },
    {
        title: "sequence with overlap",
        sample: sample1,
        source: sample1Src
    },
    {
        title: "sequence group",
        sample: timelineOffsets,
        source: timelineOffsetsSrc,
        animejs: "timelineOffsets",
    },
    {
        title: "iteration in sequence",
        sample: sample2,
        source: sample2Src
    },
    {
        title: "iteration in parallel",
        sample: sample3,
        source: sample3Src
    },
    {
        title: "multi-property animation",
        sample: rangeValueStaggering,
        source: rangeValueStaggeringSrc,
        animejs: "rangeValueStaggering",
    },
    {
        title: "elasticity", // animationKeyframes
        sample: animationKeyframes,
        source: animationKeyframesSrc,
        animejs: "animationKeyframes",
    },
    {
        title: "iteration with sub-sequence",
        sample: sample4,
        source: sample4Src
    },
    {
        title: "custom animation functions",
        sample: propertyKeyframes,
        source: propertyKeyframesSrc,
        animejs: "propertyKeyframes",
    },
    {
        title: "mixed parallel iterations and sequences",
        sample: TLParamsInheritance,
        source: TLParamsInheritanceSrc,
        animejs: "TLParamsInheritance",
    },
    
    // ----------------------------------------------------
    {
        type: "category",
        title: "delays"
    },
    {
        title: "simple delay",
        sample: staggeringBasics,
        source: staggeringBasicsSrc,
        animejs: "staggeringBasics",
    },
    {
        title: "variable delay per iteration",
        sample: staggeringStartValue,
        source: staggeringStartValueSrc,
        animejs: "staggeringStartValue",
    },
    
    {
        title: "parametric delay",
        sample: staggeringFrom,
        source: staggeringFromSrc,
        animejs: "staggeringFrom",
    },
    {
        title: "reverse order with delays",
        sample: staggeringDirection,
        source: staggeringDirectionSrc,
        animejs: "staggeringDirection",
    },
    {
        title: "delay with easing function",
        sample: staggeringEasing,
        source: staggeringEasingSrc,
        animejs: "staggeringEasing",
    },
    // ----------------------------------------------------
    {
        type: "category",
        title: "grid animations"
    },
    {
        title: "scale staggering",
        sample: gridStaggering,
        source: gridStaggeringSrc,
        animejs: "gridStaggering",
    },
    {
        title: "position staggering",
        sample: gridAxisStaggering,
        source: gridAxisStaggeringSrc,
        animejs: "gridAxisStaggering",
    },
    // ----------------------------------------------------
    {
        type: "category",
        title: "svg support"
    },
    {
        title: "SVG animations",
        sample: svgAttr,
        source: svgAttrSrc,
        animejs: "svgAttr",
    },
    {
        title: "SVG points animation",
        sample: morphing,
        source: morphingSrc,
        animejs: "morphing",
    },
    // ----------------------------------------------------
    {
        type: "category",
        title: "advanced samples"
    },
    {
        title: "style transform",
        sample: transformChain,
        source: transformChainSrc
    },
    {
        title: "custom JS transformation function",
        sample: applyProperties,
        source: applyPropertiesSrc
    },
    {
        title: "sub-animation replay",
        sample: sample5,
        source: sample5Src
    }
];
