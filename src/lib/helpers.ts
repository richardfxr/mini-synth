/* === IMPORTS ============================ */
import { get } from "svelte/store";
import { motionPref } from "../storage/store";

/* === TYPES ============================== */
interface animationOptions {
    animation: Function;
    duration: number;
    y: number;
    reducedAnimation: Function | null;
}

/* === FUNCTIONS=========================== */
export function stopPropagation(e: KeyboardEvent, keyCodes: string[]): void {
    if (keyCodes.includes(e.code)) e.stopPropagation();
};

export function animate(node: HTMLElement, options: animationOptions) {
    if (get(motionPref) === "reduced" && options.reducedAnimation) {
        return options.reducedAnimation(node, { duration: options.duration });
    } else if (get(motionPref) === "reduced") {
        return null;
    } else {
        return options.animation(node, options);
    }
};