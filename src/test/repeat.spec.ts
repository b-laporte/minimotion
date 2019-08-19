import * as assert from 'assert';
import { Anim } from '../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("repeat", () => {

    beforeEach(reset);

    it("should not run for 0 times", async function () {
        async function anim(a: Anim) {
            await a.repeat(0, a => {
                a.animate({ target: "#x", top: [0, 100], duration: 30, easing: linear });
            });
            a.animate({ target: "#y", top: [0, 100], duration: 5, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #y.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 1, "lastTick");
    });

    it("should work on simple animation", async function () {
        async function anim(a: Anim) {
            await a.repeat(2, a => {
                a.animate({ target: "#x", top: [0, 100], duration: 30, easing: linear });
            });
            a.animate({ target: "#y", top: [0, 100], duration: 30, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 50px;',
            '2: #x.top = 100px;',
            '2: #x.top = 0px;',
            '3: #x.top = 50px;',
            '4: #x.top = 100px;',
            '4: #y.top = 0px;',
            '5: #y.top = 50px;',
            '6: #y.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should provide loop count", async function () {
        async function anim(a: Anim) {
            await a.repeat(3, (a, count) => {
                a.animate({ target: "#x", top: [100 * count, 100 * (count + 1)], duration: 16 * (count + 1), easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 100px;',
            '1: #x.top = 100px;',
            '2: #x.top = 150px;',
            '3: #x.top = 200px;',
            '3: #x.top = 200px;',
            '4: #x.top = 233.3px;',
            '5: #x.top = 266.7px;',
            '6: #x.top = 300px;'
        ], "logs ok");
    });

});
