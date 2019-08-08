import * as assert from 'assert';
import { Anim } from './../core/types';
import { reset, TestPlayer, logs, animCtxtXYZ, lastTick, TestElement } from "./fixtures";
import { linear, easeOutElastic } from '../core/easings';

describe("animate", () => {

    beforeEach(reset);

    it("should animate a CSS property linearly", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [100, 200], duration: 100, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 100px;",
            "1: #x.top = 116.7px;",
            "2: #x.top = 133.3px;",
            "3: #x.top = 150px;",
            "4: #x.top = 166.7px;",
            "5: #x.top = 183.3px;",
            "6: #x.top = 200px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "lastTick");
    });


    it("should support delay", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [0, 100], duration: 50, delay: 30, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "2: #x.top = 0px;",
            "3: #x.top = 33.3px;",
            "4: #x.top = 66.7px;",
            "5: #x.top = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 6, "lastTick");
    });

    it("should support elasticity", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 200, easing: linear });
            a.animate({ target: "#y", top: [0, 100], duration: 200, easing: easeOutElastic, elasticity: .7 });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            // linear
            '0: #x.top = 0px;',
            '1: #x.top = 7.7px;',
            '2: #x.top = 15.4px;',
            '3: #x.top = 23.1px;',
            '4: #x.top = 30.8px;',
            '5: #x.top = 38.5px;',
            '6: #x.top = 46.2px;',
            '7: #x.top = 53.8px;',
            '8: #x.top = 61.5px;',
            '9: #x.top = 69.2px;',
            '10: #x.top = 76.9px;',
            '11: #x.top = 84.6px;',
            '12: #x.top = 92.3px;',
            '13: #x.top = 100px;',
            // easeOutElastic with .7 elasticity (very elastic)
            '13: #y.top = 0px;',
            '14: #y.top = 54.8px;',
            '15: #y.top = 93.5px;',
            '16: #y.top = 109.7px;',
            '17: #y.top = 111px;',
            '18: #y.top = 106.6px;',
            '19: #y.top = 102.2px;',
            '20: #y.top = 99.7px;',
            '21: #y.top = 99px;',
            '22: #y.top = 99.2px;',
            '23: #y.top = 99.6px;',
            '24: #y.top = 99.9px;',
            '25: #y.top = 100.1px;',
            '26: #y.top = 100px;'
        ], "logs ok");
    });

    it("should work with 1 tick duration", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: [0, 100], duration: 20, easing: linear });
        }

        const p = new TestPlayer(animCtxtXYZ(), anim);
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

        const p = new TestPlayer(animCtxtXYZ(), anim);
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
        const p = new TestPlayer(animCtxtXYZ(), anim);
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

        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.7px;",
            "3: #x.top = 100px;",
            "3: #y.left = 0px;",
            "4: #y.left = 33.3px;",
            "5: #y.left = 66.7px;",
            "6: #y.left = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 7, "last tick");
    });

    it("should support positive release time", async function () {
        async function anim(a: Anim) {
            await a.animate({ target: "#x", top: [0, 100], duration: 50, easing: linear, release: 30 });
            a.animate({ target: "#y", left: [0, 100], duration: 30, easing: linear });
        }
        const p = new TestPlayer(animCtxtXYZ(), anim);
        await p.play();

        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "1: #x.top = 33.3px;",
            "2: #x.top = 66.7px;",
            "3: #x.top = 100px;",
            "5: #y.left = 0px;",
            "6: #y.left = 50px;",
            "7: #y.left = 100px;"
        ], "logs ok");
        assert.equal(lastTick(), 8, "last tick");
    });

    async function anim1(a: Anim, topValue) {
        a.animate({ target: "#x", top: topValue, duration: 32, easing: linear });
    }

    it("should support units", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim1, [['0em', '100em']]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 0em;",
            "1: #x.top = 50em;",
            "2: #x.top = 100em;"
        ], "logs");
    });

    it("should support target only", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim1, ['100em']);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 0em;",
            "1: #x.top = 50em;",
            "2: #x.top = 100em;"
        ], "logs");
    });

    it("should support relative target += ", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim1, [['200em', '+=100']]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 200em;",
            "1: #x.top = 250em;",
            "2: #x.top = 300em;"
        ], "logs");
    });

    it("should support relative target -= ", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim1, [['200', '-=100em']]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 200em;",
            "1: #x.top = 150em;",
            "2: #x.top = 100em;"
        ], "logs");
    });

    it("should support relative target *= ", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim1, [['200em', '*=2']]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 200em;",
            "1: #x.top = 300em;",
            "2: #x.top = 400em;"
        ], "logs");
    });

    async function anim2(a: Anim, opacityValue) {
        a.animate({ target: "#x", opacity: opacityValue, duration: 32, easing: linear });
    }

    it("should support unit-less properties ", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim2, [0.5]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.opacity = 1;",
            "1: #x.opacity = 0.75;",
            "2: #x.opacity = 0.5;"
        ], "logs");
    });

    async function anim3(a: Anim, colorValue) {
        a.animate({ target: "#x", color: colorValue, duration: 32, easing: linear });
    }

    it("should support color values (#xxx and #xxxxxx)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [['#000', '#0AF0FF']]);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.color = rgba(0, 0, 0, 1);",
            "1: #x.color = rgba(5, 120, 128, 1);",
            "2: #x.color = rgba(10, 240, 255, 1);"
        ], "logs");
    });

    it("should support color values (rgb and rgba)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [['rgb(250,0,100)', 'rgba(100,100,200,0.5)']]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.color = rgba(250, 0, 100, 1);',
            '1: #x.color = rgba(175, 50, 150, 0.75);',
            '2: #x.color = rgba(100, 100, 200, 0.5);'
        ], "logs");
    });

    it("should support color values (hsl and hsla)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, [['hsl(120,100%,50%)', 'hsla(60, 0%, 100%, .5)']]);
        await p.play();
        assert.deepEqual(logs(), [
            '0: #x.color = rgba(0, 255, 0, 1);',
            '1: #x.color = rgba(128, 255, 128, 0.75);',
            '2: #x.color = rgba(255, 255, 255, 0.5);'
        ], "logs");
    });

    it("should support color values (no from value)", async function () {
        const p = new TestPlayer(animCtxtXYZ(), anim3, ['#0AF0FF']);
        await p.play();
        assert.deepEqual(logs(), [
            "0: #x.color = rgba(255, 0, 0, 1);", // dom value is red in test fixture
            "1: #x.color = rgba(133, 120, 128, 1);",
            "2: #x.color = rgba(10, 240, 255, 1);"
        ], "logs");
    });

    it("should read the precision of 'to' value", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: ["-0.001%", "0.00100%"], duration: 40, easing: linear });
        }
        const p = new TestPlayer(animCtxtXYZ(), anim, ['#0AF0FF']);
        await p.play();
        assert.deepEqual(logs(), [
           "0: #x.top = -0.001%;",
           "1: #x.top = -0.00033%;",
           "2: #x.top = 0.00033%;",
           "3: #x.top = 0.001%;",
        ], "logs");
    });

    it("should read the precision of 'from' value", async function () {
        function anim(a: Anim) {
            a.animate({ target: "#x", top: ["-0.001001%", "0.001%"], duration: 40, easing: linear });
        }
        const p = new TestPlayer(animCtxtXYZ(), anim, ['#0AF0FF']);
        await p.play();
        assert.deepEqual(logs(), [
           "0: #x.top = -0.001001%;",
           "1: #x.top = -0.000334%;",
           "2: #x.top = 0.000333%;",
           "3: #x.top = 0.001%;",
        ], "logs");
    });
    
    it("should support applyProperties", async function () {
        const player = new TestPlayer([], animate);

        const actualProperties = {
            length: [],
            color: [],
        };

        function animate(a) {
            a.animate({
                applyProperties: (properties) => {
                    for (const [property, value] of Object.entries(properties)) {
                        actualProperties[property].push(value);
                    }
                },
                duration: 32,
                easing: linear,

                length: [0, 100],
                color: ['#000000', '#FFFFFF'],
            });
        }

        await player.play();
        assert.deepEqual(actualProperties, {
            length: ['0', '50', '100'],
            color: [
                'rgba(0, 0, 0, 1)',
                'rgba(128, 128, 128, 1)',
                'rgba(255, 255, 255, 1)',
            ],
        });
    });

    it("should support applyProperties with no 'from' but an initProperties instead", async function () {
        const player = new TestPlayer([], animate);

        const actualProperties = {
            length: [],
            color: [],
        };

        function animate(a) {
            a.animate({
                initProperties: (properties) => {
                    properties.length = 0;
                    properties.color = '#000000';
                },
                applyProperties: (properties) => {
                    for (const [property, value] of Object.entries(properties)) {
                        actualProperties[property].push(value);
                    }
                },
                duration: 32,
                easing: linear,

                length: 100,
                color: '#FFFFFF',
            });
        }

        await player.play();
        assert.deepEqual(actualProperties, {
            length: ['0', '50', '100'],
            color: [
                'rgba(0, 0, 0, 1)',
                'rgba(128, 128, 128, 1)',
                'rgba(255, 255, 255, 1)',
            ],
        });
    });

    it("should receive target inside initProperties and applyProperties", async function () {
        const target = new TestElement('x');
        const player = new TestPlayer([target], animate);

        function animate(a) {
            a.animate({
                target: '#x',
                initProperties: (properties, target) => assert.strictEqual(target, target),
                applyProperties: (properties, target) => assert.strictEqual(target, target),
                duration: 32,
                dummy: 100,
            });
        }

        await player.play();
    });

    it("should support initProperties with no applyProperties in condition a target is given", async function () {
        const player = new TestPlayer([new TestElement('x')], animate);

        function animate(a) {
            a.animate({
                target: '#x',
                initProperties: (properties) => {
                    const offset = 0;
                    properties.top = offset;
                    properties.left = offset;
                    properties.color = '#000000';
                },
                duration: 32,
                easing: linear,

                top: 100,
                left: 100,
                color: '#FFFFFF',
            });
        }
        await player.play();
        assert.deepEqual(logs(), [
            "0: #x.top = 0px;",
            "0: #x.left = 0px;",
            "0: #x.color = rgba(0, 0, 0, 1);",

            "1: #x.top = 50px;",
            "1: #x.left = 50px;",
            "1: #x.color = rgba(128, 128, 128, 1);",

            "2: #x.top = 100px;",
            "2: #x.left = 100px;",
            "2: #x.color = rgba(255, 255, 255, 1);",
        ], "logs");
    });

    // transform prop
    // svg attributes

    // should log error if no targets / invalid target
});