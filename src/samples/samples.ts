import { easeInCubic, easeOutBack, linear } from './../../misc/src/core/easings';
import { Anim } from "../core/types";
import { easeInOutCubic, easeOutCubic } from '../core/easings';
import { Player } from '../core/anim';

let r = document.getElementById("progressRange"), player: Player | undefined, animDuration = 0;

function syncPlayer() {
    if (!r || !player) return;
    (r as any).value = Math.trunc(100 * player.position / animDuration);
}

let listeners = {
    "progressRange::input": function (player: Player) {
        let v = parseInt(r!["value"], 10); // 0 <= v <= 100
        if (player && animDuration) {
            player.move(animDuration * v / 100);
        }
    },
    "playBtn::click": async function (player: Player) {
        if (player.position === animDuration) {
            await player!.move(0);
        }
        player!.play({ onupdate: syncPlayer });
    },
    "playBackBtn::click": async function (player: Player) {
        if (player.position === 0) {
            await player.move(animDuration);
        }
        player.play({ forward: false, onupdate: syncPlayer });
    },
    "pauseBtn::click": function (player: Player) {
        player.pause();
    },
    "stopBtn::click": async function (player: Player) {
        await player.stop();
        syncPlayer()
    }
}
for (let k in listeners) {
    if (!listeners.hasOwnProperty(k)) continue;
    if (k.match(/(\w+)\:\:(\w+)/)) {
        let b = document.getElementById(RegExp.$1);
        if (b) {
            b.addEventListener(RegExp.$2, () => {
                if (!player) return;
                listeners[k](player);
            });
        }
    }
}

async function sample1(a: Anim) {
    a.defaults({ duration: 500, easing: easeInOutCubic })
    await a.animate({ target: ".square1", left: [0, 500], release: -400 });
    await a.animate({ target: ".square2", left: [0, 500], release: -100, easing: linear });
    a.animate({ target: ".square3", left: [0, 500] });
}

async function sample2(a: Anim) {
    a.iterate({ targets: ".square", sequence: true }, a => {
        a.animate({ left: [0, 500], duration: 100, easing: easeInOutCubic, release: -80 });
    });
}

async function sample3(a: Anim) {
    a.iterate(".square", (a, idx) => {
        a.animate({ left: [0, 500], duration: 100, easing: easeInOutCubic, delay: idx * 40 });
    });
}

async function sample4(a: Anim) {
    a.iterate({ targets: ".square" }, async (a, idx) => {
        await a.animate({ delay: idx * 100, left: [0, 300], duration: 400, easing: easeInCubic });
        await a.animate({ left: [300, 100], duration: 200, easing: easeOutBack });
        a.animate({ left: [100, 500], duration: 400, easing: easeOutCubic });
    });
}

async function init() {
    player = new Player(sample4);
    animDuration = await player.duration();
}

init();
