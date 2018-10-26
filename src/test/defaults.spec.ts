import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick } from "./fixtures";
import { linear } from '../core/easings';

describe("defaults", () => {

    beforeEach(reset);

    it("should be able to set target, duration and easing", async function () {
        function anim(a: Anim) {
            a.defaults({ target: "#x", duration: 60, easing: linear })
            a.animate({ top: [100, 200] });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;",
            "1: #x.top = 125px;",
            "2: #x.top = 150px;",
            "3: #x.top = 175px;",
            "4: #x.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 5, "lastTick");
    });

    it("should be able to be changed over time", async function () {
        async function anim(a: Anim) {
            a.defaults({ target: "#x", duration: 60, easing: linear })
            await a.animate({ top: [100, 200] });
            a.defaults({ target: "#y" });
            a.animate({ top: [100, 200] });
        }

        let p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;",
            "1: #x.top = 125px;",
            "2: #x.top = 150px;",
            "3: #x.top = 175px;",
            "4: #x.top = 200px;",
            "4: #y.top = 100px;",
            "5: #y.top = 125px;",
            "6: #y.top = 150px;",
            "7: #y.top = 175px;",
            "8: #y.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 9, "lastTick");
    });

});