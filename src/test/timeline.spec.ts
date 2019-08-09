import * as assert from 'assert';
import { TimeLine } from '../core/anim';
import { Anim } from '../core/types';
import { linear } from '../core/easings';
import { TestPlayer, animCtxtXYZ, logs, reset, lastTick } from './fixtures';
import { activateLogs } from '../core/utils';

describe("Timeline", () => {

    beforeEach(reset);

    describe("convertDuration", () => {
        const convertDuration = TimeLine.convertDuration;

        it("should work for positive numbers", function () {
            assert.equal(convertDuration(7, 1), 0, "7::1");
            assert.equal(convertDuration(8, 1), 16, "8::1");
            assert.equal(convertDuration(9, 1), 16, "9::1");
            assert.equal(convertDuration(32, 1), 32, "32::1");
            assert.equal(convertDuration(32, 2), 16, "32::2");
            assert.equal(convertDuration(32, 0.5), 64, "32::.5");
            assert.equal(convertDuration(35, 1), 32, "35::1");
            assert.equal(convertDuration(39, 1), 32, "39::1");
            assert.equal(convertDuration(40, 1), 48, "40::1");
            assert.equal(convertDuration(48, 1), 48, "48::1");
        });

        it("should work for negative numbers", function () {
            assert.equal(convertDuration(-32, 1), -32, "-32::1");
            assert.equal(convertDuration(-32, 2), -16, "-32::2");
            assert.equal(convertDuration(-32, 0.5), -64, "-32::.5");
            assert.equal(convertDuration(-35, 1), -32, "-35::1");
            assert.equal(convertDuration(-39, 1), -32, "-39::1");
            assert.equal(convertDuration(-41, 1), -48, "-41::1");
            assert.equal(convertDuration(-48, 1), -48, "-48::1");
        });
    });

    it("should provide random numbers within a defined range", function () {
        // simply check that we are within range
        const ac = new TimeLine("random test", a => { });

        const v1 = ac.random(10, 20),
            v2 = ac.random(10, 20),
            v3 = ac.random(10, 20);
        [v1, v2, v3].forEach((v) => {
            assert.equal(v >= 10, true, "v>=10");
            assert.equal(v <= 20, true, "v<=20");
            assert.equal(v - Math.trunc(v), 0, "no decimal value");
        });
    });

    describe("move", () => {

        async function tl(a: Anim) {
            a.defaults({ easing: linear, duration: 64 });
            await a.animate({ target: "#x", top: [0, 200] });
            await a.sequence(a => {
                a.animate({ target: "#y", top: [0, 200], release: -32 });
            }, a => {
                a.animate({ target: "#z", top: [0, 200], release: -32 });
            });
            a.animate({ target: "#x", top: [200, 400] });
            await a.animate({ target: "#y", top: [200, 400], delay: 32 });
            a.animate({ target: "#z", top: [200, 400] });
        }

        // This animation is ordered as follows:
        // x: XXXX    XXXX
        // y:     XXXX  XXXX
        // z:       XXXX    XXXX

        it("should end at 288ms", async function () {
            const p = new TestPlayer(animCtxtXYZ(), tl);
            await p.play();
            assert.equal(lastTick(), (288 + 16) / 16, "lastTick");

            let m = p["timeLine"].firstMarker, arr: number[] = [];
            while (m) {
                arr.push(m.time);
                m = m.next;
            }
            // note: 96 is not in the list below as it belongs to the sequence markers
            assert.deepEqual(arr, [0, 64, 128, 160, 192, 224, 288], "root timeline markers");

            const sequence = p["timeLine"].getMarker(64)!.startEntities![0] as TimeLine;
            m = sequence.firstMarker; arr = [];
            while (m) {
                arr.push(m.time);
                m = m.next;
            }
            assert.deepEqual(arr, [64, 96, 128, 160], "sequence markers");
        });

        async function moveFwd(time) {
            const p = new TestPlayer(animCtxtXYZ(), tl);
            return p.move(time);
        }

        it("should allow to quickly jump forward in a tween (1)", async function () {
            const pos = await moveFwd(48);
            assert.equal(pos, 48, "pos is 48");
            assert.deepEqual(logs(), [
                '0: #x.top = 150px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (2)", async function () {
            await moveFwd(80);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 50px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (3)", async function () {
            await moveFwd(96);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 100px;',
                '0: #z.top = 0px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (4)", async function () {
            await moveFwd(128);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 100px;',
                '0: #x.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (5)", async function () {
            await moveFwd(144);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 150px;',
                '0: #x.top = 250px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (6)", async function () {
            await moveFwd(160);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 300px;',
                '0: #y.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (7)", async function () {
            await moveFwd(192);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 300px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (8)", async function () {
            await moveFwd(256);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 300px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump forward in a tween (9)", async function () {
            await moveFwd(288);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 400px;'
            ], 'logs ok');
        });

        async function moveFullFwdBack(time) {
            const p = new TestPlayer(animCtxtXYZ(), tl);
            await p.move(288);
            reset();
            return p.move(time);
        }

        it("should allow to quickly jump full fwd/back in a tween (1)", async function () {
            await moveFullFwdBack(256);
            assert.deepEqual(logs(), [
                '0: #z.top = 300px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (2)", async function () {
            await moveFullFwdBack(192);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 300px;',
                '0: #x.top = 400px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (3)", async function () {
            await moveFullFwdBack(160);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 300px;',
                '0: #z.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (4)", async function () {
            await moveFullFwdBack(144);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 250px;',
                '0: #z.top = 150px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (5)", async function () {
            await moveFullFwdBack(128);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 200px;',
                '0: #z.top = 100px;',
                '0: #y.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (6)", async function () {
            await moveFullFwdBack(96);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 200px;',
                '0: #z.top = 0px;',
                '0: #y.top = 100px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (7)", async function () {
            await moveFullFwdBack(48);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 200px;',
                '0: #z.top = 0px;',
                '0: #y.top = 0px;',
                '0: #x.top = 150px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back in a tween (8)", async function () {
            await moveFullFwdBack(0);
            assert.deepEqual(logs(), [
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 200px;',
                '0: #z.top = 0px;',
                '0: #y.top = 0px;',
                '0: #x.top = 0px;'
            ], 'logs ok');
        });

        async function moveFullFwdBackFwd(time) {
            const p = new TestPlayer(animCtxtXYZ(), tl);
            await p.move(288);
            await p.move(0);
            reset();
            return p.move(time);
        }

        it("should allow to quickly jump full fwd/back/fwd in a tween (1)", async function () {
            await moveFullFwdBackFwd(48);
            assert.deepEqual(logs(), [
                '0: #x.top = 150px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (2)", async function () {
            await moveFullFwdBackFwd(80);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 50px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (3)", async function () {
            await moveFullFwdBackFwd(96);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 100px;',
                '0: #z.top = 0px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (4)", async function () {
            await moveFullFwdBackFwd(128);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 100px;',
                '0: #x.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (5)", async function () {
            await moveFullFwdBackFwd(144);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 150px;',
                '0: #x.top = 250px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (6)", async function () {
            await moveFullFwdBackFwd(160);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #y.top = 200px;',
                '0: #x.top = 300px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (7)", async function () {
            await moveFullFwdBackFwd(192);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #y.top = 300px;',
                '0: #x.top = 400px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (8)", async function () {
            await moveFullFwdBackFwd(256);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 300px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump full fwd/back/fwd in a tween (9)", async function () {
            await moveFullFwdBackFwd(288);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 400px;'
            ], 'logs ok');
        });

        async function moveFwdBackFwd(tl, time1, time2, time3) {
            const p = new TestPlayer(animCtxtXYZ(), tl);
            const trace = false;
            trace && activateLogs();
            trace && console.log("---- PART 1")
            await p.move(time1);
            reset();
            trace && console.log("---- PART 2")
            await p.move(time2);
            logs().push("BACK");
            trace && console.log("---- PART 3")
            return p.move(time3);
        }

        it("should allow to quickly jump partially fwd/back/fwd in a tween (1)", async function () {
            await moveFwdBackFwd(tl, 144, 80, 224);
            assert.deepEqual(logs(), [
                '0: #x.top = 200px;',
                '0: #z.top = 0px;',
                '0: #y.top = 50px;',
                'BACK',
                '0: #y.top = 200px;',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 200px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump partially fwd/back/fwd in a tween (2)", async function () {
            await moveFwdBackFwd(tl, 208, 144, 288);
            assert.deepEqual(logs(), [
                '0: #y.top = 200px;',
                '0: #x.top = 250px;',
                '0: #z.top = 150px;',
                'BACK',
                '0: #z.top = 200px;',
                '0: #x.top = 400px;',
                '0: #y.top = 400px;',
                '0: #z.top = 400px;'
            ], 'logs ok');
        });

        it("should allow to quickly jump partially fwd/back/fwd in a tween (3)", async function () {
            await moveFwdBackFwd(tl, 48, 0, 48);
            assert.deepEqual(logs(), [
                '0: #x.top = 0px;',
                'BACK',
                '0: #x.top = 150px;'
            ], 'logs ok');
        });

        async function tl2(a: Anim) {
            a.iterate({ targets: ".colItem", sequence: true }, a => {
                a.animate({ left: [0, 100], duration: 100, easing: linear, release: -50 });
            });
        }

        it("should support sequence iteration fwd/back/fwd (1)", async function () {
            await moveFwdBackFwd(tl2, 200, 0, 96);
            assert.deepEqual(logs(), [
                '0: #z.left = 0px;',
                '0: #y.left = 0px;',
                '0: #x.left = 0px;',
                'BACK',
                '0: #x.left = 100px;',
                '0: #y.left = 50px;',
                '0: #z.left = 0px;'
            ], 'logs ok');
        });

        it("should support sequence iteration fwd/back/fwd (2)", async function () {
            await moveFwdBackFwd(tl2, 16, 0, 96);
            assert.deepEqual(logs(), [
                '0: #x.left = 0px;',
                'BACK',
                '0: #x.left = 100px;',
                '0: #y.left = 50px;',
                '0: #z.left = 0px;'
            ], 'logs ok');
        });

        async function tl3(a: Anim) {
            a.iterate({ targets: ".colItem", sequence: false }, a => {
                a.animate({ left: [0, 100], duration: 100, easing: linear, release: -50 });
            });
        }

        it("should support parallel iteration fwd/back/fwd (1)", async function () {
            await moveFwdBackFwd(tl3, 200, 0, 200);
            assert.deepEqual(logs(), [
                '0: #z.left = 0px;',
                '0: #y.left = 0px;',
                '0: #x.left = 0px;',
                'BACK',
                '0: #z.left = 100px;',
                '0: #y.left = 100px;',
                '0: #x.left = 100px;'
            ], 'logs ok');
        });

        it("should support parallel iteration fwd/back/fwd (2)", async function () {
            await moveFwdBackFwd(tl3, 32, 0, 64);
            assert.deepEqual(logs(), [
                '0: #x.left = 0px;',
                '0: #y.left = 0px;',
                '0: #z.left = 0px;',
                'BACK',
                '0: #z.left = 66.6px;',
                '0: #y.left = 66.6px;',
                '0: #x.left = 66.6px;'
            ], 'logs ok');
        });

        async function tl4(a: Anim) {
            a.play({ alternate: true }, a => {
                a.animate({ target: "#x", left: [0, 100], duration: 96, easing: linear });
            });
        }

        it("should support play fwd/back/fwd (1)", async function () {
            await moveFwdBackFwd(tl4, 48, 0, 24);
            assert.deepEqual(logs(), [
                '0: #x.left = 0px;',
                'BACK',
                '0: #x.left = 0px;',
                '0: #x.left = 25px;'
            ], 'logs');
        });

        it("should support play fwd/back/fwd (2)", async function () {
            await moveFwdBackFwd(tl4, 48, 0, 80);
            assert.deepEqual(logs(), [
                '0: #x.left = 0px;',
                'BACK',
                '0: #x.left = 0px;',
                '0: #x.left = 83.3px;'
            ], 'logs');
        });

        // + repeat
        // + iterate
    });

});