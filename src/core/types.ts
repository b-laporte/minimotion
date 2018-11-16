

export type Selector = StyleElement | String;

export interface SelectorContext {
    querySelector(selector: string): StyleElement | null;
    querySelectorAll(selector: string): StyleElement[] | null;
}

export interface StyleElement {
    style: { [stylePropName: string]: any }
}

type StyleNumber = number | string | (number | string)[];

export interface Instructions {
    (a: Anim): void | Promise<any>;
}

export interface ControlParams {
    target?: Selector;
    easing?: (elapsed: number, elasticity: number) => number;    // e.g. easeInOutQuad
    duration?: number;              // e.g. 1000
    delay?: number;                 // e.g. 1000 -> delay before execution
    release?: number;               // e.g. -20 -> to release the function 20ms before completion
    elasticity?: number;
    speed?: number;                 // speed ratio e.g. 1 for normal speed, 2 for 2x faster, 0.5 for 2x slower
}

interface StyleParams {
    translateX?: StyleNumber;
    translateY?: StyleNumber;
    translateZ?: StyleNumber;
    rotate?: StyleNumber;
    rotateX?: StyleNumber;
    rotateY?: StyleNumber;
    rotateZ?: StyleNumber;
    scale?: StyleNumber;
    scaleX?: StyleNumber;
    scaleY?: StyleNumber;
    scaleZ?: StyleNumber;
    skewX?: StyleNumber;
    skewY?: StyleNumber;
    perspective?: StyleNumber;
    [stylePropName: string]: any;
}

export type TweenType = 'transform' | 'attribute' | 'css' | 'invalid';
export type RelativeOperator = '+=' | '-=' | '*=' | '';

export interface AnimateParams extends ControlParams, StyleParams {
    onUpdate?: () => void; // callback function called on any update
}

export interface IterationParams {
    targets: Selector; // | Selector[]
    sequence?: boolean;
}

export interface PlayParams {
    alternate?: boolean;
    times?: number;
    speed?: number;
    backSpeed?: number;
    delay?: number;
    release?: number;
    // startPos / endPos ?
    // duration ? (replace endPos & times)
}

export interface Anim {
    defaults(params: ControlParams): void;
    animate(params: AnimateParams): Promise<any>; // animate a style property

    iterate(targetsOrParams: Selector | IterationParams, instructions: (a: Anim, idx: number, total: number, e: StyleElement) => void | Promise<any>): Promise<any>;
    repeat(times: number, instructions: ((a: Anim, loopCount: number) => void)): Promise<any>;
    sequence(...blocks: ((a: Anim) => void)[]): Promise<any>;
    parallelize(...tracks: ((a: Anim) => void)[]): Promise<any>;

    group(instructions: ((a: Anim) => void)): Promise<any>;
    group(name: string, instructions: ((a: Anim) => void)): Promise<any>;

    play(instructions: ((a: Anim) => void)): Promise<any>;
    play(params: PlayParams, instructions: ((a: Anim) => void)): Promise<any>;

    // // setStyle
    // // addCssClass ->async // cf class list
    // // swing() startPosition, endPosition = time or -1, backSpeed, fwdSpeed, cycles, dynamic
    // player() -> returns a player ?

    delay(timeMs: number): Promise<any>;
    random(min: number, max: number): number;
}

export interface AnimContainer {
    addEntity(ae: AnimEntity): void;
    removeEntity(ae: AnimEntity): void;
}

export interface AnimEntity {
    name: string;
    isRunning: boolean;                // true if the entity is in its parent timeline running list
    startRegistered: boolean;          // false if the entity hasn't registered in the parent start markers
    endRegistered: boolean;            // false if the entity hasn't registered in the parent end markers
    nextEntity: AnimEntity | null;     // next entity in the running list
    skipRendering: boolean;            // true if rendering should not be done (e.g. for duration() calculation)

    attach(parent: AnimContainer);
    init(startTime: number): void;
    getNextMarkerPosition(time: number, forward: boolean): number;
    displayFrame(time: number, targetTime: number, forward: boolean);
    done: boolean;                     // true if the animation has completed
    released: boolean;                 // true if the entity is released (i.e. next instructions can be run)

    // // isFinite: boolean; // todo
    // next(tick: number): void;    // move animation to next step and updates done and released  // next(stateHolder?)
    // apply(state) -> replay / rewind or seek
}

export interface AnimTimeLine {
    move(time: number): Promise<any>;
}

export interface AnimMarker {
    prev: AnimMarker | undefined;
    next: AnimMarker | undefined;
    time: number;
    startEntities: AnimEntity[] | undefined;
    endEntities: AnimEntity[] | undefined;
}

export interface PlayArguments {
    onupdate?: (time: number) => void;
    forward?: boolean;
    raf?: (callback: (time: number) => void) => void;
    speed?: number;
    // until?: number; // time position
}

export interface AnimPlayer {
    position: number;
    isPlaying: boolean;
    duration(): Promise<number>; // -1 if infinite
    move(timePosition: number): Promise<number>;
    play(args?: PlayArguments): Promise<number>;
    pause(): void;
    stop(): Promise<number>;
}
