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
    export let currentTrack: "melody" | "beats"; // bind
    export let currentSubdiv: number; // bind
    export let melody: Tone.Unit.Frequency[][];
    export let notes: Tone.Unit.Frequency[];
    export let beats: string[][];
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



<div
    class="reels"
    style="--melodyLength: {melody.length}">
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

        <div class="tracks">
            <!-- track marks above tracks -->
            <div class="trackMarkers">
                {#each melody as _}
                    <div class="subdiv"></div>
                {/each}
            </div>

            <!-- melody track -->
            <article
                id="melody"
                class="track"
                class:active={currentTrack === 'melody'}>
                <label>
                    <input
                        class="visuallyHidden"
                        type="radio"
                        bind:group={currentTrack}
                        name="track"
                        value="melody">
                    <span class="visuallyHidden">Melody track</span>
                </label>
                <div class="trackTerminal">⇥</div>
                <div class="noteMarkers">
                    <div class="noteMarker"></div>
                    <div class="noteMarker"></div>
                    <div class="noteMarker"></div>
                    <div class="noteMarker"></div>
                </div>
                {#each melody as subdiv, i}
                    <div
                        class="subdiv"
                        class:active={i === currentSubdiv}>
                        {#each subdiv as note}
                            <p class="note-{notes.indexOf(note) % 12}">
                                <span>{notes.indexOf(note) + 1}</span>
                            </p>
                        {/each}
                    </div>
                {/each}
                <div class="trackTerminal">⇤</div>
            </article>

            <!-- beats track -->
            <article
                id="beats"
                class="track"
                class:active={currentTrack === 'beats'}>
                <label>
                    <input
                        class="visuallyHidden"
                        type="radio"
                        bind:group={currentTrack}
                        name="track"
                        value="beats">
                    <span class="visuallyHidden">Beats track</span>
                </label>
                <div class="trackTerminal">⇥</div>
                <div class="noteMarkers">
                    <div class="noteMarker"></div>
                    <div class="noteMarker"></div>
                    <div class="noteMarker"></div>
                </div>
                {#each beats as subdiv, i}
                    <div
                        class="subdiv"
                        class:active={i === currentSubdiv}>
                        {#each subdiv as beat}
                            <p class="beat-{beat}">
                                <span>{beat}</span>
                            </p>
                        {/each}
                    </div>
                {/each}
                <div class="trackTerminal">⇤</div>
            </article>
        </div>
        
        <div class="trackPadding"></div>
    </div>
</div>



<style lang="scss">
    .reels {
        // internal variables
        --_clr-scrollbar: var(--clr-0);
        --_clr-thumb: var(--clr-500);
        --_trackTerminal-width: 25px;
        --_noteMarker-width: 8px;
        --_note-height: 22px;

        position: sticky;
        top: calc(-1 * (var(--reels-pad-top) + var(--trackMarker-height)) + var(--border-width-thick));
        z-index: 1000;

        background-color: var(--clr-100);
        border-bottom: solid var(--border-width-thick) var(--clr-100);

        &::before, &::after {
            // playhead
            content: "";
            pointer-events: none;
            position: absolute;
            background-color: red;
        }

        &::before {
            // playhead circle
            --_size: 10px;

            top: calc(var(--reels-pad-top) + 0.5 * var(--trackMarker-height) - 0.5 * var(--_size));
            left: calc(50% - 0.5 * var(--_size));
            width: var(--_size);
            height: var(--_size);
            z-index: 1001;

            border-radius: var(--borderRadius-round);
        }
        
        &::after {
            // playhead bar
            top: calc(var(--reels-pad-top) + 0.5 * var(--trackMarker-height));
            bottom: -8px;
            left: calc(50% - 0.5 * var(--border-width-thick) - var(--border-width-thin));
            width: calc(var(--border-width-thick) + 2 * var(--border-width-thin));
            z-index: 1000;
            
            border: solid var(--border-width-thin) var(--clr-0);
            box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.2);
        }
    }

    .tapes {
        display: flex;
        flex-flow: row nowrap;
        position: relative;

        cursor: grab;

        padding: var(--reels-pad-top) 0 var(--border-width-thick) 0;
        overflow-x: auto;

        scrollbar-width: thin;
        scrollbar-color: var(--_clr-thumb) var(--_clr-scrollbar);

        &.dragging, &.dragging .track label {
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
        animation: tracksLoad 0.25s cubic-bezier(0, .36, .34, 1) 1;
    }

    .trackMarkers {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), var(--subdivWidth));
        height: var(--trackMarker-height);

        padding: var(--pad-sm) 0;

        .subdiv {
            position: relative;
            height: 100%;

            &:first-child::before,
            &:nth-child(4n)::before {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;

                width: var(--border-width);
                background-color: var(--clr-250);
            }

            &:first-child::before {
                left: calc(-0.5 * var(--border-width));
            }

            &:nth-child(4n)::before {
                right: calc(-0.5 * var(--border-width));
            }
        }
    }

    .track {
        // internal variable
        --_clr-border: var(--clr-350);

        display: grid;
        grid-template-columns: var(--_trackTerminal-width) var(--_noteMarker-width) repeat(var(--melodyLength), var(--subdivWidth)) var(--_trackTerminal-width);
        background-color: var(--clr-100);
        position: relative;
        z-index: 2;

        border-bottom: solid var(--border-width) var(--_clr-border);
        // offset trackTerminal at each end
        margin-right: calc(-1 * var(--_trackTerminal-width));
        margin-left: calc(-1 * (var(--_trackTerminal-width) + var(--_noteMarker-width)));

        transition: border-color var(--trans-fast) ease;

        // prevent text highlighting on drag
        -webkit-user-select:none;
        user-select: none;

        &#melody {
            height: var(--melody-height);
            border-top: solid var(--border-width) var(--_clr-border);
            border-bottom: solid var(--border-width) var(--clr-800);
        }

        &#beats {
            height: var(--beats-height);
        }

        label {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 100;

            cursor: grab;

            input {
                // prevent track scroll on radio input
                visibility: hidden;
            }
        }

        .trackTerminal {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            color: var(--clr-0);
            background-color: var(--_clr-border);

            transition: background-color var(--trans-fast) ease;
        }

        .noteMarkers {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--border-width);

            padding: var(--border-width-thick) 0;
            border-right: dashed calc(0.5 * var(--border-width-thick)) var(--clr-150);
            overflow: hidden;

            .noteMarker {
                flex-shrink: 0;
                width: var(--border-width);
                height: var(--_note-height);
                
                background-color: var(--clr-350);
            }
        }

        .subdiv {
            display: flex;
            flex-direction: column;
            gap: var(--border-width);
            position: relative;

            padding: var(--border-width-thick) 0;
            border-right: dashed calc(0.5 * var(--border-width-thick)) var(--clr-150);
            border-left: dashed calc(0.5 * var(--border-width-thick)) var(--clr-150);

            overflow-x: visible;
            overflow-y: hidden;

            &.active {
                background-color: var(--clr-0);
            }

            p {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: var(--_note-height);

                color: var(--clr-1000);
                text-align: center;
                background-color: var(--clr-200);

                transition: background-color var(--trans-fast) ease;
            }
        }

        &.active {
            --_clr-border: var(--clr-800);

            .subdiv p {
                // note colors
                @for $i from 0 through 11 {
                    &.note-#{$i} {
                        background-color: var(--clr-note-#{$i});
                    }
                }

                // beat colors
                @each $beat, $index in $beats {
                    &.beat-#{$beat} {
                        background-color: var(--clr-note-#{$index});
                    }
                }
            }
        }
    }

    /* === ANIMATIONS ========================= */
    @keyframes tracksLoad {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>