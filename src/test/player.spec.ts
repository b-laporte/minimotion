import * as assert from 'assert';
import { TimeLine, activateLogs } from '../core/anim';
import { Anim } from '../core/types';
import { linear } from '../core/easings';
import { TestPlayer, animCtxtXYZ, logs, reset, lastTick } from './fixtures';

describe("Player", () => {

    beforeEach(reset);

    async function anim1(a: Anim) {
        await a.animate({ target: "#x", top: [0, 100], duration: 100, easing: linear, release: -20 });
        a.animate({ target: "#y", left: [0, 100], duration: 100, easing: linear, release: -20 });
    }

    it("should provide the current time position", async function () {
        let p = new TestPlayer(animCtxtXYZ(), anim1);
        assert.equal(p.position(), 0, "position 0");
        await p.move(80);
        assert.equal(p.position(), 80, "position 80");
        await p.move(10);
        assert.equal(p.position(), 10, "position 10");
        await p.move(0);
        assert.equal(p.position(), 0, "position 0 (end)");
    });

    it("should provide the full animation duration() from start position", async function () {
        let p = new TestPlayer(animCtxtXYZ(), anim1);

        let d = await p.duration();
        assert.equal(d, 176, "duration");
        assert.deepEqual(logs(), [], "DOM has not been updated");
        assert.equal(p.position(), 0, "back to 0");
    });

    it("should provide the full animation duration() from any position", async function () {
        let p = new TestPlayer(animCtxtXYZ(), anim1);
        await p.move(48);
        reset();
        let d = await p.duration();
        assert.equal(d, 176, "duration");
        assert.deepEqual(logs(), [], "DOM has not been updated");
        assert.equal(p.position(), 48, "back to 48");
    });

});
