import sample1 from "./sample1";
import sample2 from "./sample2";
import sample3 from "./sample3";
import sample4 from "./sample4";
import sample5 from "./sample5";
import transformChain from "./transformChain";
import applyFunction from "./applyFunction";
import { DEMOS as animejsDemos } from "./animejs";

export const DEMOS = [
  {
    title: "Sample 1",
    sample: sample1
  },
  {
    title: "Sample 2",
    sample: sample2
  },
  {
    title: "Sample 3",
    sample: sample3
  },
  {
    title: "Sample 4",
    sample: sample4
  },
  {
    title: "Sample 5",
    sample: sample5
  },
  {
    title: "Transform chain",
    sample: transformChain
  },
  {
    title: "Apply function",
    sample: applyFunction
  },
  ...animejsDemos
];
