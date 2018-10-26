import { easeInCubic, easeOutBack } from './../../misc/src/core/easings';
import { Anim } from "../core/types";
import { easeInOutCubic, easeInCirc, easeOutCubic } from '../core/easings';
import { Player } from '../core/anim';



let r = document.getElementById("progressRange"), player: Player | undefined;
if (r) {
    r.addEventListener("input", e => {
        let v = parseInt(r!["value"], 10); // 0 <= v <= 100
        let maxTime = 150;
        if (player) {
            player.move(maxTime * v / 100);
        }
    })
}

async function sample1(a: Anim) {
    a.defaults({ duration: 100, easing: easeInOutCubic })
    await a.animate({ target: ".square1", left: [0, 500], release: -80 });
    await a.animate({ target: ".square2", left: [0, 500], release: -80 });
    a.animate({ target: ".square3", left: [0, 500] });
}

async function sample2(a: Anim) {
    // TODO: fix bugs
    a.iterate({ targets: ".square", sequence: true }, a => {
        a.animate({ left: [0, 500], duration: 100, easing: easeInOutCubic, release: -80 });
    });
}

async function sample3(a: Anim) {
    a.iterate({ targets: ".square" }, async (a, idx) => {
        await a.animate({ delay: idx * 20, left: [0, 300], duration: 20, easing: easeInCubic });
        await a.animate({ left: [300, 100], duration: 10, easing: easeOutBack });
        a.animate({ left: [100, 500], duration: 40, easing: easeOutCubic });
    });
}

function init() {
    player = new Player(sample3);

}

init();
