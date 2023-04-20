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
            id="melody"
            class="track"
            style="--melodyLength: {melody.length}">
            <div class="trackMarker">⇥</div>
            {#each melody as subdiv, i}
                <div
                    class="subdiv"
                    class:active={i === currentSubdiv}>
                    {#each subdiv as note}
                        <p class="note-{notes.indexOf(note) % 12}">
                            {notes.indexOf(note) + 1}
                        </p>
                    {/each}
                </div>
            {/each}
            <div class="trackMarker">⇤</div>
        </div>
        <div class="trackPadding"></div>
    </div>
</div>



<style lang="scss">
    .reels {
        // internal variables
        --_clr-scrollbar: var(--clr-100);
        --_clr-thumb: var(--clr-500);
        --_trackMarker-width: 25px;

        position: sticky;
        top: 0;
        z-index: 1000;

        background-color: var(--clr-0);
        border-bottom: solid var(--border-width) var(--clr-0);
        
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
        display: flex;
        flex-flow: row nowrap;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;

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
        background-color: var(--clr-100);
    }

    .track {
        display: grid;
        grid-template-columns: var(--_trackMarker-width) repeat(var(--melodyLength), var(--subdivWidth)) var(--_trackMarker-width);
        background-color: var(--clr-0);
        position: relative;
        z-index: 2;

        // offset trackMarker at each end
        margin: 0 calc(-1 * var(--_trackMarker-width));

        // prevent text highlighting on drag
        -webkit-user-select:none;
        user-select: none;

        &#melody {
            height: var(--melody-height);
        }

        .trackMarker {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            color: var(--clr-0);
            background-color: var(--clr-800);
        }

        .subdiv {
            display: flex;
            flex-direction: column;
            gap: 1px;
            position: relative;

            padding: 10px 0;
            border-right: dashed calc(0.5 * var(--border-width)) var(--clr-100);
            border-left: dashed calc(0.5 * var(--border-width)) var(--clr-100);

            overflow-x: visible;
            overflow-y: hidden;

            &.active {
                background-color: var(--clr-100);
            }

            p {
                color: var(--clr-1000);
                text-align: center;

                padding: 3px;
                border-radius: var(--borderRadius-sm);

                @for $i from 0 through 11 {
                    &.note-#{$i} {
                        background-color: var(--clr-note-#{$i});
                    }
                }
            }
        }
    }
</style>