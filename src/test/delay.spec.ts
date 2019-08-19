import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("delay", () => {
    beforeEach(reset);

    it("should work in an async function", async function () {
        async function anim(a: Anim) {
            await a.delay(50);
            logs().push(lastTick()+": delay executed");
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "3: delay executed"
        ], "logs ok");
        assert.equal(lastTick(), 4, "lastTick");
    });

    it("should work before animation", async function () {
        async function anim(a: Anim) {
            await a.delay(50);
            a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "3: #x.top = 0px;",
            "4: #x.top = 33.3px;",
            "5: #x.top = 66.7px;",
            "6: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work for a 1 frame delay", async function () {
        async function anim(a: Anim) {
            await a.delay(20);
            a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "1: #x.top = 0px;",
            "2: #x.top = 33.3px;",
            "3: #x.top = 66.7px;",
            "4: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 5, "lastTick");
    });

    it("should work after animation", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            await a.delay(50);
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.7px;",
            "3: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work between animations", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            await a.delay(50);
            a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.7px;",
            "3: #x.top = 100px;",
            "6: #y.left = 0px;",
            "7: #y.left = 33.3px;",
            "8: #y.left = 66.7px;",
            "9: #y.left = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 10, "lastTick");
    });

});