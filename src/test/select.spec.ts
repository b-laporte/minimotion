import * as assert from 'assert';
import { reset, animCtxtXYZ, TestPlayer } from "./fixtures";

describe("select", () => {
    beforeEach(reset);

    function noop() { }

    it("should return single elements ", async function () {
        const p = new TestPlayer(animCtxtXYZ(), noop);

        const x = p.timeline.select("#x");
        assert.equal(x !== null, true, "x is not null");
        assert.equal(x!.style !== null, true, "x has a style property");
    });

    it("should return null in case of invalid selector", async function () {
        const p = new TestPlayer(animCtxtXYZ(), noop);

        const x = p.timeline.select("");
        assert.equal(x === null, true, "x is null");

        const y = p.timeline.select("foo");
        assert.equal(y === null, true, "y is null");

        const z = p.timeline.select(undefined as any);
        assert.equal(z === null, true, "z is null");
    });

    it("should select multiple elements", function () {
        const p = new TestPlayer(animCtxtXYZ(), noop);

        const x = p.timeline.selectAll(".colItem");
        assert.equal(x!.constructor === Array, true, "x is an array");
        assert.equal(x!.length, 3 , "x has 3 items");
    });
});
