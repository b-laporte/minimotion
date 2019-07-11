import * as assert from "assert";
import {
  clearFastElementTransformsCache,
  setTransformValue,
  getTransformValue
} from "../core/transforms";

describe("transforms", () => {
  it("getElementTransforms should return correct default values", () => {
    const element = ({ style: {} } as any) as HTMLElement;
    assert.equal(getTransformValue(element, "translate"), "0px");
    assert.equal(getTransformValue(element, "translateX"), "0px");
    assert.equal(getTransformValue(element, "translateY"), "0px");
    assert.equal(getTransformValue(element, "translateZ"), "0px");
    assert.equal(getTransformValue(element, "rotate"), "0deg");
    assert.equal(getTransformValue(element, "rotateX"), "0deg");
    assert.equal(getTransformValue(element, "rotateY"), "0deg");
    assert.equal(getTransformValue(element, "rotateZ"), "0deg");
    assert.equal(getTransformValue(element, "skew"), "0deg");
    assert.equal(getTransformValue(element, "skewX"), "0deg");
    assert.equal(getTransformValue(element, "skewY"), "0deg");
    assert.equal(getTransformValue(element, "skewZ"), "0deg");
    assert.equal(getTransformValue(element, "scale"), "1");
    assert.equal(getTransformValue(element, "scaleX"), "1");
    assert.equal(getTransformValue(element, "scaleY"), "1");
    assert.equal(getTransformValue(element, "scaleZ"), "1");
    assert.equal(getTransformValue(element, "perspective"), "0px");
  });

  it("getElementTransforms / setElementTransforms should work correctly", () => {
    const element = ({
      style: { transform: "translate(1em) scale(2) rotate(3rad)" }
    } as any) as HTMLElement;
    // defined:
    assert.equal(getTransformValue(element, "translate"), "1em");
    assert.equal(getTransformValue(element, "scale"), "2");
    assert.equal(getTransformValue(element, "rotate"), "3rad");
    // not defined:
    assert.equal(getTransformValue(element, "perspective"), "0px");

    setTransformValue(element, "translate", "2em");
    assert.equal(
      element.style.transform!.trim(),
      "translate(2em) scale(2) rotate(3rad)"
    );
    assert.equal(getTransformValue(element, "translate"), "2em");

    setTransformValue(element, "scale", "3");
    assert.equal(
      element.style.transform!.trim(),
      "translate(2em) scale(3) rotate(3rad)"
    );
    assert.equal(getTransformValue(element, "scale"), "3");

    setTransformValue(element, "rotate", "1rad");
    assert.equal(
      element.style.transform!.trim(),
      "translate(2em) scale(3) rotate(1rad)"
    );
    assert.equal(getTransformValue(element, "rotate"), "1rad");

    setTransformValue(element, "perspective", "2px");
    assert.equal(
      element.style.transform!.trim(),
      "translate(2em) scale(3) rotate(1rad) perspective(2px)"
    );
    assert.equal(getTransformValue(element, "perspective"), "2px");
  });

  it("getElementTransforms / setElementTransforms should use the cache correctly", () => {
    let transformGetterCalls = 0;
    let transformSetterCalls = 0;
    let transformValue = "translate(1em)";
    const element = ({
      style: {
        get transform() {
          transformGetterCalls++;
          return transformValue;
        },
        set transform(value) {
          transformSetterCalls++;
          transformValue = value;
        }
      }
    } as any) as HTMLElement;
    assert.equal(transformGetterCalls, 0);
    assert.equal(getTransformValue(element, "translate"), "1em");
    assert.equal(transformGetterCalls, 1);
    assert.equal(getTransformValue(element, "rotate"), "0deg");
    assert.equal(transformGetterCalls, 1);
    assert.equal(transformSetterCalls, 0);
    setTransformValue(element, "rotate", "1deg");
    assert.equal(transformSetterCalls, 1);
    assert.equal(transformGetterCalls, 1);
    assert.equal(transformValue.trim(), "translate(1em) rotate(1deg)");
    assert.equal(getTransformValue(element, "rotate"), "1deg");
    assert.equal(transformGetterCalls, 1);
    clearFastElementTransformsCache(element);
    transformValue = "scale(3)";
    assert.equal(getTransformValue(element, "translate"), "0px");
    assert.equal(transformGetterCalls, 2);
    assert.equal(getTransformValue(element, "rotate"), "0deg");
    assert.equal(getTransformValue(element, "scale"), "3");
    assert.equal(transformGetterCalls, 2);
    assert.equal(transformSetterCalls, 1);
    setTransformValue(element, "scale", "5");
    assert.equal(transformSetterCalls, 2);
    assert.equal(transformGetterCalls, 2);
    assert.equal(transformValue.trim(), "scale(5)");
    assert.equal(getTransformValue(element, "scale"), "5");
    assert.equal(transformGetterCalls, 2);
  });
});
