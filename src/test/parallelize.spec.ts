import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("parallelize", () => {

    beforeEach(reset);

    it("should work with 0 blocks", async function () {

        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 20, easing: linear });
            await a.parallelize();
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
            await a.parallelize(a => {

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
            a.parallelize(a => {
                a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.7px;",
            "3: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 4, "lastTick");
    });

    it("should work with 1 block and be awaited", async function () {

        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 30, easing: linear });
            await a.parallelize(a => {
                a.animate({ target: "#y", top: [0, 100], duration: 30, easing: linear });
            });
            await a.animate({ target: "#z", top: [200, 300], duration: 30, easing: linear });
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
            "4: #z.top = 200px;",
            "5: #z.top = 250px;",
            "6: #z.top = 300px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work with 2 blocks", async function () {

        function anim(a: Anim) {
            a.parallelize(a => {
                a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            }, a => {
                a.animate({ target: "#y", left: [0, 100], duration: 60, easing: linear, delay: 15 });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '1: #y.left = 0px;',
            '2: #x.top = 66.7px;',
            '2: #y.left = 25px;',
            '3: #x.top = 100px;',
            '3: #y.left = 50px;',
            '4: #y.left = 75px;',
            '5: #y.left = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 6, "lastTick");
    });

    it("should work with 2 async blocks - with await & external delay", async function () {

        function anim(a: Anim) {
            a.parallelize(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear });
            }, async a => {
                await a.delay(15);
                await a.animate({ target: "#y", left: [0, 100], duration: 60, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '1: #y.left = 0px;',
            '2: #x.top = 66.7px;',
            '2: #y.left = 25px;',
            '3: #x.top = 100px;',
            '3: #y.left = 50px;',
            '4: #y.left = 75px;',
            '5: #y.left = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 6, "lastTick");
    });

    it("should work with 2 blocks - with await & following entries", async function () {

        async function anim(a: Anim) {
            await a.parallelize(async a => {
                a.animate({ target: "#x", top: [0, 100], duration: 80, easing: linear });
            }, async a => {
                a.animate({ target: "#y", left: [0, 100], duration: 60, easing: linear, delay: 20 });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 20px;',
            '1: #y.left = 0px;',
            '2: #x.top = 40px;',
            '2: #y.left = 25px;',
            '3: #x.top = 60px;',
            '3: #y.left = 50px;',
            '4: #x.top = 80px;',
            '4: #y.left = 75px;',
            '5: #x.top = 100px;',
            '5: #y.left = 100px;',
            '5: #z.top = 0px;',
            '6: #z.top = 33.3px;',
            '7: #z.top = 66.7px;',
            '8: #z.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 9, "lastTick");
    });

    it("should work with 2 awaited blocks - with await & following entries", async function () {

        async function anim(a: Anim) {
            await a.parallelize(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 80, easing: linear });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 60, easing: linear, delay: 20 });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 20px;',
            '1: #y.left = 0px;',
            '2: #x.top = 40px;',
            '2: #y.left = 25px;',
            '3: #x.top = 60px;',
            '3: #y.left = 50px;',
            '4: #x.top = 80px;',
            '4: #y.left = 75px;',
            '5: #x.top = 100px;',
            '5: #y.left = 100px;',
            '5: #z.top = 0px;',
            '6: #z.top = 33.3px;',
            '7: #z.top = 66.7px;',
            '8: #z.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 9, "lastTick");
    });

    it("should work with 2 awaited blocks - without await", async function () {

        async function anim(a: Anim) {
            a.parallelize(async a => {
                await a.animate({ target: "#x", top: [0, 100], duration: 80, easing: linear });
            }, async a => {
                await a.animate({ target: "#y", left: [0, 100], duration: 60, easing: linear, delay: 20 });
            });
            a.animate({ target: "#z", top: [0, 100], duration: 50, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '0: #z.top = 0px;',
            '1: #x.top = 20px;',
            '1: #y.left = 0px;',
            '1: #z.top = 33.3px;',
            '2: #x.top = 40px;',
            '2: #y.left = 25px;',
            '2: #z.top = 66.7px;',
            '3: #x.top = 60px;',
            '3: #y.left = 50px;',
            '3: #z.top = 100px;',
            '4: #x.top = 80px;',
            '4: #y.left = 75px;',
            '5: #x.top = 100px;',
            '5: #y.left = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 6, "lastTick");
    });

});
