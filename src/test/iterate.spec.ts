import * as assert from 'assert';
import { Anim } from '../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("iterate", () => {
    beforeEach(reset);

    it("should not do anything when no matching selector", async function () {
        function anim(a: Anim) {
            a.iterate("xxx", a => {
                a.animate({ top: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();
        assert.deepEqual(logs(), [], "logs ok");
        assert.equal(lastTick(), 1, "lastTick");
    });

    it("should work for a simple animation in parallel", async function () {
        function anim(a: Anim) {
            a.iterate(".colItem", a => {
                a.animate({ top: [0, 100], duration: 50, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '0: #y.top = 0px;',
            '0: #z.top = 0px;',
            '1: #x.top = 33.3px;',
            '1: #y.top = 33.3px;',
            '1: #z.top = 33.3px;',
            '2: #x.top = 66.6px;',
            '2: #y.top = 66.6px;',
            '2: #z.top = 66.6px;',
            '3: #x.top = 100px;',
            '3: #y.top = 100px;',
            '3: #z.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 4, "lastTick");
    });

    it("should work for a simple animation in sequence", async function () {
        function anim(a: Anim) {
            a.iterate({ targets: ".colItem", sequence: true }, a => {
                a.animate({ top: [0, 100], duration: 30, easing: linear });
            });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 50px;',
            '2: #x.top = 100px;',
            '2: #y.top = 0px;',
            '3: #y.top = 50px;',
            '4: #y.top = 100px;',
            '4: #z.top = 0px;',
            '5: #z.top = 50px;',
            '6: #z.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 7, "lastTick");
    });

    it("should work for a simple animation in sequence with early release and defaults", async function () {
        async function anim(a: Anim) {
            a.defaults({ target: "#x", duration: 50, easing: linear })
            await a.iterate({ targets: ".colItem", sequence: true }, a => {
                a.animate({ top: [0, 100], release: -20 });
            });
            a.animate({ top: [0, 100] })
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '2: #x.top = 66.6px;',
            '2: #y.top = 0px;',
            '3: #x.top = 100px;',
            '3: #y.top = 33.3px;',
            '4: #y.top = 66.6px;',
            '4: #z.top = 0px;',
            '5: #y.top = 100px;',
            '5: #z.top = 33.3px;',
            '6: #z.top = 66.6px;',
            '6: #x.top = 0px;',
            '7: #z.top = 100px;',
            '7: #x.top = 33.3px;',
            '8: #x.top = 66.6px;',
            '9: #x.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 10, "lastTick");
    });

    it("should work for a simple animation in parallel with delay, target, defaults and forEach arguments", async function () {
        async function anim(a: Anim) {
            a.defaults({ target: "#x", duration: 50, easing: linear })
            await a.iterate(".colItem", async (a, idx, total, e) => {
                await a.animate({ target: e, top: [0, 100], delay: 30 * idx });
                if (idx === total - 1) {
                    a.animate({ left: [0, 100], duration: 30 });
                }
            });
            a.animate({ top: [0, 100] })
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            '0: #x.top = 0px;',
            '1: #x.top = 33.3px;',
            '2: #x.top = 66.6px;',
            '2: #y.top = 0px;',
            '3: #x.top = 100px;',
            '3: #y.top = 33.3px;',
            '4: #y.top = 66.6px;',
            '4: #z.top = 0px;',
            '5: #y.top = 100px;',
            '5: #z.top = 33.3px;',
            '6: #z.top = 66.6px;',
            '7: #z.top = 100px;',
            '7: #z.left = 0px;',
            '8: #z.left = 50px;',
            '9: #z.left = 100px;',
            '9: #x.top = 0px;',
            '10: #x.top = 33.3px;',
            '11: #x.top = 66.6px;',
            '12: #x.top = 100px;'
        ], "logs ok");

        assert.equal(lastTick(), 13, "lastTick");
    });
    
});