import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("sequence", () => {

    beforeEach(reset);

    it("should work with 0 blocks", async function () {

        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 20, easing: linear });
            await a.sequence();
            await a.animate({ target: "#y", top: [100, 200], duration: 20, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 100px;",
            "1: #y.top = 100px;",
            "2: #y.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 3, "lastTick");
    });

    it("should work with an empty block", async function () {

        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 20, easing: linear });
            await a.sequence(a => {

            });
            await a.animate({ target: "#y", top: [100, 200], duration: 20, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 100px;",
            "1: #y.top = 100px;",
            "2: #y.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 3, "lastTick");
    });

    it("should work with 1 block", async function () {

        function anim(a: Anim) {
            a.sequence(a => {
                a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.6px;",
            "3: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 4, "lastTick");
    });

    it("should work with 1 block and be awaited", async function () {

        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 30, easing: linear });
            await a.sequence(a => {
                a.animate({ target: "#y", top: [0, 100], duration: 30, easing: linear });
            });
            await a.animate({ target: "#x", top: [200, 300], duration: 30, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 50px;",
            "2: #x.top = 100px;",
            "2: #y.top = 0px;",
            "3: #y.top = 50px;",
            "4: #y.top = 100px;",
            "4: #x.top = 200px;",
            "5: #x.top = 250px;",
            "6: #x.top = 300px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work with 2 blocks", async function () {

        function anim(a: Anim) {
            a.sequence(async a => {
                a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            }, a => {
                a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
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

        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work with 2 async blocks", async function () {
        function anim(a: Anim) {
            a.sequence(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
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
        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work with 2 async blocks + following entity", async function () {

        async function anim(a: Anim) {
            await a.sequence(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        
        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.6px;",
            "3: #x.top = 100px;",
            "3: #y.left = 0px;",
            "4: #y.left = 33.3px;",
            "5: #y.left = 66.6px;",
            "6: #y.left = 100px;",
            "6: #z.top = 0px;",
            "7: #z.top = 33.3px;",
            "8: #z.top = 66.6px;",
            "9: #z.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 10, "lastTick");
    });

    it("should work with 2 async blocks w/ release + following entity", async function () {

        async function anim(a: Anim) {
            await a.sequence(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear, release: -30 });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear, release: -30 });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '1: #y.left = 0px;',
            '2: #x.top = 66.6px;',
            '2: #y.left = 33.3px;',
            '2: #z.top = 0px;',
            '3: #x.top = 100px;',
            '3: #y.left = 66.6px;',
            '3: #z.top = 33.3px;',
            '4: #y.left = 100px;',
            '4: #z.top = 66.6px;',
            '5: #z.top = 100px;'
        ], "logs ok");
        assert.equal(lastTick(), 6, "lastTick");
    });

    it("should work with 2 async blocks w/ release + delay + following entity", async function () {
        async function anim(a: Anim) {
            await a.sequence(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear, release: -30 });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 50, easing: linear, delay: 30, release: -30 });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '2: #x.top = 66.6px;',
            '3: #x.top = 100px;',
            '3: #y.left = 0px;',
            '4: #y.left = 33.3px;',
            '4: #z.top = 0px;',
            '5: #y.left = 66.6px;',
            '5: #z.top = 33.3px;',
            '6: #y.left = 100px;',
            '6: #z.top = 66.6px;',
            '7: #z.top = 100px;'
        ], "logs ok");
        assert.equal(lastTick(), 8, "lastTick");
    });
});
