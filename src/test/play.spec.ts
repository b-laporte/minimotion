import * as assert from 'assert';
import { Anim } from '../core/types';
import { reset, logs, animCtxtXYZ, TestPlayer } from "./fixtures";
import { linear } from '../core/easings';

describe("play", () => {
    beforeEach(reset);

    it("should work with no arguments", async function () {
        async function anim1(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 16, easing: linear });
            await a.play(async a => {
                await a.animate({ target: "#y", top: [0, 100], duration: 48, easing: linear });
                a.animate({ target: "#y", left: [0, 100], duration: 48, easing: linear });
            })
            a.animate({ target: "#z", top: [0, 100], duration: 16, easing: linear });
        }
        const p = new TestPlayer(animCtxtXYZ(), anim1);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 100px;',
            '1: #y.top = 0px;',
            '2: #y.top = 33.3px;',
            '3: #y.top = 66.6px;',
            '4: #y.top = 100px;',
            '4: #y.left = 0px;',
            '5: #y.left = 33.3px;',
            '6: #y.left = 66.6px;',
            '7: #y.left = 100px;',
            '7: #z.top = 0px;',
            '8: #z.top = 100px;'
        ], "logs");
    });

    async function anim2(a: Anim, playParams, initEndDuration = 1) {
        await a.animate({ target: "#x", top: [0, 100], duration: initEndDuration, easing: linear });
        await a.play(playParams, async a => {
            await a.animate({ target: "#y", top: [0, 100], duration: 32, easing: linear });
            a.animate({ target: "#y", left: [0, 100], duration: 32, easing: linear });
        })
        a.animate({ target: "#z", top: [0, 100], duration: initEndDuration, easing: linear });
    }

    it("should work with alternate mode", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim2, [{ alternate: true }]);

        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 100px;',
            '0: #y.top = 0px;',
            '1: #y.top = 50px;',
            '2: #y.top = 100px;',
            '2: #y.left = 0px;',
            '3: #y.left = 50px;',
            '4: #y.left = 100px;',
            '5: #y.left = 50px;',
            '6: #y.left = 0px;',
            '6: #y.top = 100px;',
            '7: #y.top = 50px;',
            '8: #y.top = 0px;',
            '8: #z.top = 100px;'
        ], "logs");
    });

    async function anim3(a: Anim, playParams) {
        await a.play(playParams, async a => {
            a.animate({ target: "#x", left: [0, 100], duration: 48, easing: linear });
        })
    }

    it("should work with cycles (simple timeline)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [{ times: 3 }]);
        await p.play();
        assert.deepEqual(logs(), [
            // cycle 1
            '0: #x.left = 0px;',
            '1: #x.left = 33.3px;',
            '2: #x.left = 66.6px;',
            '3: #x.left = 100px;',
            // cycle 2
            '4: #x.left = 33.3px;', // y.left = 0px is skipped to avoid losing one frame
            '5: #x.left = 66.6px;',
            '6: #x.left = 100px;',
            // cycle 3
            '7: #x.left = 33.3px;',
            '8: #x.left = 66.6px;',
            '9: #x.left = 100px;'
        ], "logs");
    });

    it("should work with cycles (advanced timeline)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim2, [{ times: 3 }]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 100px;',
            // cycle 1
            '0: #y.top = 0px;',
            '1: #y.top = 50px;',
            '2: #y.top = 100px;',
            '2: #y.left = 0px;',
            '3: #y.left = 50px;',
            '4: #y.left = 100px;',
            // cycle 2
            '5: #y.left = 0px;', // move back from last position
            '5: #y.top = 50px;', // first position skipped to avoid losing one frame (last frame was displayed instead)
            '6: #y.top = 100px;',
            '6: #y.left = 0px;',
            '7: #y.left = 50px;',
            '8: #y.left = 100px;',
            // cycle 3
            '9: #y.left = 0px;',
            '9: #y.top = 50px;',
            '10: #y.top = 100px;',
            '10: #y.left = 0px;',
            '11: #y.left = 50px;',
            '12: #y.left = 100px;',
            // next
            '12: #z.top = 100px;'
        ], "logs");
    });

    it("should work with cycles + alternate (simple timeline)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [{ times: 3, alternate: true }]);
        await p.play();
        assert.deepEqual(logs(), [
            // cycle 1
            '0: #x.left = 0px;',
            '1: #x.left = 33.3px;',
            '2: #x.left = 66.6px;',
            '3: #x.left = 100px;',
            // back
            '4: #x.left = 66.6px;',
            '5: #x.left = 33.3px;',
            '6: #x.left = 0px;',
            // cycle 2
            '7: #x.left = 33.3px;',
            '8: #x.left = 66.6px;',
            '9: #x.left = 100px;',
            // back
            '10: #x.left = 66.6px;',
            '11: #x.left = 33.3px;',
            '12: #x.left = 0px;',
            // cycle 3
            '13: #x.left = 33.3px;',
            '14: #x.left = 66.6px;',
            '15: #x.left = 100px;',
            // back
            '16: #x.left = 66.6px;',
            '17: #x.left = 33.3px;',
            '18: #x.left = 0px;'
        ], "logs");
    });

    it("should work support different backward speed", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [{ times: 3, alternate: true, backSpeed: 0.5 }]);
        await p.play();
        assert.deepEqual(logs(), [
            // cycle 1
            '0: #x.left = 0px;',
            '1: #x.left = 33.3px;',
            '2: #x.left = 66.6px;',
            '3: #x.left = 100px;',
            // back
            '4: #x.left = 83.3px;',
            '5: #x.left = 66.6px;',
            '6: #x.left = 50px;',
            '7: #x.left = 33.3px;',
            '8: #x.left = 16.6px;',
            '9: #x.left = 0px;',
            // cycle 2
            '10: #x.left = 33.3px;',
            '11: #x.left = 66.6px;',
            '12: #x.left = 100px;',
            // back
            '13: #x.left = 83.3px;',
            '14: #x.left = 66.6px;',
            '15: #x.left = 50px;',
            '16: #x.left = 33.3px;',
            '17: #x.left = 16.6px;',
            '18: #x.left = 0px;',
            // cycle 3
            '19: #x.left = 33.3px;',
            '20: #x.left = 66.6px;',
            '21: #x.left = 100px;',
            // back
            '22: #x.left = 83.3px;',
            '23: #x.left = 66.6px;',
            '24: #x.left = 50px;',
            '25: #x.left = 33.3px;',
            '26: #x.left = 16.6px;',
            '27: #x.left = 0px;'
        ], "logs");
    });

    it("should work support different forward speed", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [{ times: 3, alternate: true, speed: 0.5 }]);
        await p.play();
        assert.deepEqual(logs(), [
            // cycle 1
            '0: #x.left = 0px;',
            '1: #x.left = 16.6px;',
            '2: #x.left = 33.3px;',
            '3: #x.left = 50px;',
            '4: #x.left = 66.6px;',
            '5: #x.left = 83.3px;',
            '6: #x.left = 100px;',
            // back
            '7: #x.left = 66.6px;',
            '8: #x.left = 33.3px;',
            '9: #x.left = 0px;',
            // cycle 2
            '10: #x.left = 16.6px;',
            '11: #x.left = 33.3px;',
            '12: #x.left = 50px;',
            '13: #x.left = 66.6px;',
            '14: #x.left = 83.3px;',
            '15: #x.left = 100px;',
            // back
            '16: #x.left = 66.6px;',
            '17: #x.left = 33.3px;',
            '18: #x.left = 0px;',
            // cycle 3
            '19: #x.left = 16.6px;',
            '20: #x.left = 33.3px;',
            '21: #x.left = 50px;',
            '22: #x.left = 66.6px;',
            '23: #x.left = 83.3px;',
            '24: #x.left = 100px;',
            // back
            '25: #x.left = 66.6px;',
            '26: #x.left = 33.3px;',
            '27: #x.left = 0px;'
        ], "logs");
    });

    it("should support delay", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim2, [{ alternate: true, delay: 48 }, 16]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 100px;',
            // delay
            '4: #y.top = 0px;',
            '5: #y.top = 50px;',
            '6: #y.top = 100px;',
            '6: #y.left = 0px;',
            '7: #y.left = 50px;',
            '8: #y.left = 100px;',
            '9: #y.left = 50px;',
            '10: #y.left = 0px;',
            '10: #y.top = 100px;',
            '11: #y.top = 50px;',
            '12: #y.top = 0px;',
            '12: #z.top = 0px;',
            '13: #z.top = 100px;'
        ], "logs");
    });

    it("should support negative release", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim2, [{ alternate: true, release: -48 }, 16]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 100px;',
            // start
            '1: #y.top = 0px;',
            '2: #y.top = 50px;',
            '3: #y.top = 100px;',
            '3: #y.left = 0px;',
            '4: #y.left = 50px;',
            '5: #y.left = 100px;',
            // release
            '6: #z.top = 0px;',
            '6: #y.left = 50px;',
            '7: #y.left = 0px;',
            '7: #y.top = 100px;',
            '7: #z.top = 100px;',
            '8: #y.top = 50px;',
            '9: #y.top = 0px;'
        ], "logs");
    });

    async function anim4(a: Anim, playParams, initEndDuration = 1) {
        await a.animate({ target: "#x", top: [0, 100], duration: initEndDuration, easing: linear });
        a.defaults({ delay: 48, release: 32 });
        await a.play(playParams, async a => {
            await a.animate({ target: "#y", top: [0, 100], duration: 32, easing: linear });
            a.animate({ target: "#y", left: [0, 100], duration: 32, easing: linear });
        })
        a.defaults({ delay: 0, release: 0 });
        a.animate({ target: "#z", top: [0, 100], duration: initEndDuration, easing: linear });
    }

    it("should support delay and positive release (from defaults)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim4, [{ alternate: true }, 16]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 100px;',
            // delay
            '4: #y.top = 0px;',
            '5: #y.top = 50px;',
            '6: #y.top = 100px;',
            '6: #y.left = 0px;',
            '7: #y.left = 50px;',
            '8: #y.left = 100px;',
            '9: #y.left = 50px;',
            '10: #y.left = 0px;',
            '10: #y.top = 100px;',
            '11: #y.top = 50px;',
            '12: #y.top = 0px;',
            // release
            '14: #z.top = 0px;',
            '15: #z.top = 100px;'
        ], "logs");
    });

});