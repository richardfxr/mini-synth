<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type { Tweened } from 'svelte/motion';
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let playbackState: Tone.PlaybackState;
    export let tweening: boolean;
    export let tweenedProgress: Tweened<number>;
    export let subdivWidth: number;
    export let currentSubdiv: number; // bind
    export let melody: Tone.Unit.Frequency[][];
    export let notes: Tone.Unit.Frequency[];
    export let hasManuallyScrolled: boolean; // bind

    tweenedProgress.subscribe(() => {
        // set scrollLeft using progress (tweened)
        if (tweening) {
            // console.log("progress: " + $progress);
            tapes.scrollLeft = $tweenedProgress;
        }
    });

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let tapes: HTMLElement;
    let dragging = false;
</script>



<div class="reels">
    <div
        class="tapes"
        class:dragging={dragging}
        style="--subdivWidth: {subdivWidth}px"
        bind:this={tapes}
        on:scroll={() => {
            // update progress if it is not updating scroll
            if (!tweening) {
                tweenedProgress.set(tapes.scrollLeft);
                hasManuallyScrolled = true;
                let calculatedubdiv = Math.floor(tapes.scrollLeft / subdivWidth);

                // prevent currentSubdiv from producing invalid index
                if (calculatedubdiv >= melody.length) {
                    currentSubdiv = melody.length - 1;
                } else if (calculatedubdiv < 0) {
                    currentSubdiv = 0;
                } else {
                    currentSubdiv = calculatedubdiv;
                }
            }
        }}
        on:pointerdown={() => {
            if (playbackState === "started") dispatch('pause');
        }}
        on:mousedown={() => {
            dragging = true;
        }}
        on:mousemove={(e) => {
            // drag only if primary mouse button is held down
            if (e.buttons === 1) {
                dragging  = true;
                let newScrollLeft = tapes.scrollLeft - e.movementX;

                // limit newScrollLeft to be between 0 and melody.length
                if (newScrollLeft > 0)
                    newScrollLeft = 0;
                if (newScrollLeft > melody.length * subdivWidth)
                    newScrollLeft = melody.length * subdivWidth;

                tapes.scrollLeft = tapes.scrollLeft - e.movementX;
            } else {
                dragging = false;
            }
        }}>
        <div class="trackPadding"></div>
        <div
            class="tracks"
            style="--melodyLength: {melody.length}">
            {#each melody as subdiv, i}
                <div
                    class="subdiv"
                    class:active={i === currentSubdiv}>
                    {#each subdiv as note}
                        <p>{notes.indexOf(note) + 1}</p>
                    {/each}
                </div>
            {/each}
        </div>
        <div class="trackPadding"></div>
    </div>
</div>



<style lang="scss">
    .reels {
        position: sticky;
        top: 0;
        z-index: 1000;

        background-color: var(--clr-0);
        
        &::before {
            // playhead
            content: "";
            pointer-events: none;
            position: absolute;
            top: 0;
            bottom: -5px;
            left: calc(50% - 0.5px);
            width: 2px;
            z-index: 1000;
            background-color: red;
        }
    }

    .tapes {
        // internal variables
        --_clr-scrollbar: var(--clr-100);
        --_clr-thumb: var(--clr-500);

        display: flex;
        flex-flow: row nowrap;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;

        padding: 10px 0;

        cursor: grab;

        scrollbar-width: thin;
        scrollbar-color: var(--_clr-thumb) var(--_clr-scrollbar);

        &.dragging {
            cursor: grabbing;
        }

        &::-webkit-scrollbar {
            height: 2px;
        }

        &::-webkit-scrollbar-track {
            background: var(--_clr-scrollbar);
        }
        &::-webkit-scrollbar-thumb {
            background-color: var(--_clr-thumb);

            &:hover {
                background-color: var(--clr-700);
            }

            &:active {
                background-color: var(--clr-800);
            }
        }
    }

    .trackPadding {
        width: 50%;
        flex-shrink: 0;
    }

    .tracks {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), var(--subdivWidth));
        background-color: var(--clr-100);

        // prevent text highlighting on drag
        -webkit-user-select:none;
        user-select: none;

        .subdiv {
            display: flex;
            flex-direction: column;
            gap: 1px;
            padding: 10px 0.5px;

            &.active {
                background-color: var(--clr-150);
            }

            p {
                color: var(--clr-0);
                text-align: center;

                background-color: var(--clr-800);
                padding: 3px;
                border-radius: 2px;
            }
        }
    }
</style>