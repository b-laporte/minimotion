import svgAttr from "./svgAttr.svelte";
import svgAttrSrc from "source:./svgAttr.svelte";
import animationKeyframes from "./animationKeyframes.svelte";
import animationKeyframesSrc from "source:./animationKeyframes.svelte";
import propertyKeyframes from "./propertyKeyframes.svelte";
import propertyKeyframesSrc from "source:./propertyKeyframes.svelte";
import staggeringBasics from "./staggeringBasics.svelte";
import staggeringBasicsSrc from "source:./staggeringBasics.svelte";
import staggeringStartValue from "./staggeringStartValue.svelte";
import staggeringStartValueSrc from "source:./staggeringStartValue.svelte";
import rangeValueStaggering from "./rangeValueStaggering.svelte";
import rangeValueStaggeringSrc from "source:./rangeValueStaggering.svelte";
import staggeringFrom from "./staggeringFrom.svelte";
import staggeringFromSrc from "source:./staggeringFrom.svelte";
import staggeringDirection from "./staggeringDirection.svelte";
import staggeringDirectionSrc from "source:./staggeringDirection.svelte";
import staggeringEasing from "./staggeringEasing.svelte";
import staggeringEasingSrc from "source:./staggeringEasing.svelte";
import gridStaggering from "./gridStaggering.svelte";
import gridStaggeringSrc from "source:./gridStaggering.svelte";
import gridAxisStaggering from "./gridAxisStaggering.svelte";
import gridAxisStaggeringSrc from "source:./gridAxisStaggering.svelte";
import timelineBasics from "./timelineBasics.svelte";
import timelineBasicsSrc from "source:./timelineBasics.svelte";
import timelineOffsets from "./timelineOffsets.svelte";
import timelineOffsetsSrc from "source:./timelineOffsets.svelte";
import TLParamsInheritance from "./TLParamsInheritance.svelte";
import TLParamsInheritanceSrc from "source:./TLParamsInheritance.svelte";
import morphing from "./morphing.svelte";
import morphingSrc from "source:./morphing.svelte";

export const DEMOS = [
  {
    title: "animejs - svgAttr",
    sample: svgAttr,
    source: svgAttrSrc
  },
  {
    title: "animejs - animationKeyframes",
    sample: animationKeyframes,
    source: animationKeyframesSrc
  },
  {
    title: "animejs - propertyKeyframes",
    sample: propertyKeyframes,
    source: propertyKeyframesSrc
  },
  {
    title: "animejs - staggeringBasics",
    sample: staggeringBasics,
    source: staggeringBasicsSrc
  },
  {
    title: "animejs - staggeringStartValue",
    sample: staggeringStartValue,
    source: staggeringStartValueSrc
  },
  {
    title: "animejs - rangeValueStaggering",
    sample: rangeValueStaggering,
    source: rangeValueStaggeringSrc
  },
  {
    title: "animejs - staggeringFrom",
    sample: staggeringFrom,
    source: staggeringFromSrc
  },
  {
    title: "animejs - staggeringDirection",
    sample: staggeringDirection,
    source: staggeringDirectionSrc
  },
  {
    title: "animejs - staggeringEasing",
    sample: staggeringEasing,
    source: staggeringEasingSrc
  },
  {
    title: "animejs - gridStaggering",
    sample: gridStaggering,
    source: gridStaggeringSrc
  },
  {
    title: "animejs - gridAxisStaggering",
    sample: gridAxisStaggering,
    source: gridAxisStaggeringSrc
  },
  {
    title: "animejs - timelineBasics",
    sample: timelineBasics,
    source: timelineBasicsSrc
  },
  {
    title: "animejs - timelineOffsets",
    sample: timelineOffsets,
    source: timelineOffsetsSrc
  },
  {
    title: "animejs - TLParamsInheritance",
    sample: TLParamsInheritance,
    source: TLParamsInheritanceSrc
  },
  {
    title: "animejs - morphing",
    sample: morphing,
    source: morphingSrc
  }
];
