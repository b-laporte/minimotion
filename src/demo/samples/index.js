import sample1 from "./sample1";
import sample1Src from "source:./sample1";
import sample2 from "./sample2";
import sample2Src from "source:./sample2";
import sample3 from "./sample3";
import sample3Src from "source:./sample3";
import sample4 from "./sample4";
import sample4Src from "source:./sample4";
import sample5 from "./sample5";
import sample5Src from "source:./sample5";
import transformChain from "./transformChain";
import transformChainSrc from "source:./transformChain";
import applyFunction from "./applyFunction";
import applyFunctionSrc from "source:./applyFunction";
import { DEMOS as animejsDemos } from "./animejs";

export const DEMOS = [
  {
    type: "category",
    title: "Initial samples"
  },
  {
    title: "Sample 1",
    sample: sample1,
    source: sample1Src
  },
  {
    title: "Sample 2",
    sample: sample2,
    source: sample2Src
  },
  {
    title: "Sample 3",
    sample: sample3,
    source: sample3Src
  },
  {
    title: "Sample 4",
    sample: sample4,
    source: sample4Src
  },
  {
    title: "Sample 5",
    sample: sample5,
    source: sample5Src
  },
  {
    type: "category",
    title: "New samples"
  },
  {
    title: "Transform chain",
    sample: transformChain,
    source: transformChainSrc
  },
  {
    title: "Apply function",
    sample: applyFunction,
    source: applyFunctionSrc
  },
  {
    type: "category",
    title: "animejs"
  },
  ...animejsDemos.map(({ title, sample, source }) => ({
    title: title.replace("animejs - ", ""),
    sample,
    source
  }))
];
