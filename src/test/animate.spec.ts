import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("animate", () => {

    beforeEach(reset);

    it("should animate a CSS property linearly", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [100, 200], duration: 100, easing: linear });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;",
            "1: #x.top = 116.6px;",
            "2: #x.top = 133.3px;",
            "3: #x.top = 150px;",
            "4: #x.top = 166.6px;",
            "5: #x.top = 183.3px;",
            "6: #x.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });


    it("should support delay", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [0, 100], duration: 50, delay: 30, easing: linear });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "2: #x.top = 0px;",
            "3: #x.top = 33.3px;",
            "4: #x.top = 66.6px;",
            "5: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 6, "lastTick");
    });

    it("should work with 1 tick duration", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [0, 100], duration: 20, easing: linear });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 2, "lastTick");
    });

    it("should work with 0 ticks duration", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [0, 100], duration: 5, easing: linear });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 1, "lastTick");
    });

    it("should work with 0 ticks duration + await", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 5, easing: linear });
            a.animate({ target: "#y", top: [0, 100], duration: 16, easing: linear });
        }
        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;",
            "0: #y.top = 0px;",
            "1: #y.top = 100px;"
        ], "logs ok");
    });

    it("should support simple await sequences", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.6px;",
            "3: #x.top = 100px;",
            "3: #y.left = 0px;",
            "4: #y.left = 33.3px;",
            "5: #y.left = 66.6px;",
            "6: #y.left = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "last tick");
    });

    it("should support positive release time", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear, release: 30 });
            a.animate({ target: "#y", left: [0, 100], duration: 30, easing: linear });
        }
        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.6px;",
            "3: #x.top = 100px;",
            "5: #y.left = 0px;",
            "6: #y.left = 50px;",
            "7: #y.left = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 8, "last tick");
    });

    // should log error if no targets / invalid target
});