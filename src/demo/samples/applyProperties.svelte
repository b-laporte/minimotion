<script>
    import Player from "../player";
    import { easeInOutCubic } from "../../core/easings";

    async function animation(a) {
        a.animate({
            target: '.square',
            
            initProperties: (properties, target) => {
                properties.translate1 = '0';
                properties.rotation = '0';
                properties.translate2 = '0';
                properties.color = window.getComputedStyle(target)['background-color'];
                properties.alphabetIndex = 1;
            },

            applyProperties: (properties, target) => {
                const {translate1, rotation, translate2, color} = properties;
                target.style['background-color'] = color;
                target.style.transform = [
                    `translateX(${translate1}px)`,
                    `rotate(${rotation}deg)`,
                    `translateX(${translate2}px)`,
                ].join(' ');
                // sets template-bound variable (don't get confused by the similar name)
                alphabetIndex = properties.alphabetIndex;

                target.firstElementChild.style.transform = `rotate(-${rotation}deg)`;
            },

            delay: 200,
            release: 200,
            duration: 1000,
            easing: easeInOutCubic,

            translate1: 475,
            rotation: 90,
            translate2: 160,
            color: '#3e4fff',
            alphabetIndex: 26,
        });
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let alphabetIndex = 1;
    $: content = alphabet[Math.round(alphabetIndex) - 1];
</script>

<style>
    div.main {
        position: relative;
        height: 180px;
    }

    div.square {
        position: absolute;
        height: 30px;
        width: 30px;
        top: 0px;
        left: 0px;
        background-color: #fe8820;
        display: grid;
        align-items: center;
        justify-items: center;
    }
</style>

<div class="main">
     <div class="square"><span>{content}</span></div>
</div>
<Player {animation} />
