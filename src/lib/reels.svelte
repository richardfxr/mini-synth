<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type { Tweened } from 'svelte/motion';
    import type * as Tone from 'tone';
    import type { TapeName } from '../storage/db';
    import { motionPref } from '../storage/store';
    import Tape from '$lib/tape.svelte';
    // icons
    import MinusIcon from '$lib/SVGs/minusIcon.svelte';
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';
    import TapeArrows from '$lib/SVGs/tapeArrows.svelte';

    /* === PROPS ============================== */
    export let playbackState: Tone.PlaybackState;
    export let tweening: boolean;
    export let snapping: boolean;
    export let tweenedProgress: Tweened<number>;
    export let untweenedProgress: number;
    export let subdivWidth: number;
    export let currentTapeName: TapeName; // bind
    export let currentSubdiv: number; // bind
    export let melody: Tone.Unit.Frequency[][];
    export let notes: Tone.Unit.Frequency[];
    export let beats: string[][];
    export let hasManuallyScrolled: boolean; // bind
    export let isReady: boolean;

    tweenedProgress.subscribe(value => {
        // set scrollLeft using progress (tweened)
        if (tweening && tapes) {
            tapes.scrollLeft = value;
        }
    });

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let tapes: HTMLElement;
    let dragging = false;
    let radioPointerDown = false

    $: untweenedProgress, snapTapes();

    function snapTapes() {
        if ($motionPref === "full" || !tapes) return;
        console.log("snapping to " + untweenedProgress);
        tapes.scrollLeft = untweenedProgress;
    }
</script>



<div
    class="reels"
    class:isReady
    style="--melodyLength: {melody.length}">

    <div class="cassette">
        <div class="housing"></div>
    </div>

    <div
        class="spools"
        class:dragging={dragging}
        style="--subdivWidth: {subdivWidth}px"
        bind:this={tapes}
        on:scroll={() => {
            if (!isReady) return;
            // update progress if it is not updating scroll
            if (!tweening && !snapping) {
                tweenedProgress.set(tapes.scrollLeft);
                hasManuallyScrolled = true;
                let calculatedSubdiv = Math.floor(tapes.scrollLeft / subdivWidth);

                // prevent currentSubdiv from producing invalid index
                if (calculatedSubdiv >= melody.length) {
                    currentSubdiv = melody.length - 1;
                } else if (calculatedSubdiv < 0) {
                    currentSubdiv = 0;
                } else {
                    currentSubdiv = calculatedSubdiv;
                }
            }
        }}
        on:pointerdown={() => {
            if (!isReady) return;
            if (playbackState === "started") dispatch('pause');
        }}
        on:mousedown={() => {
            if (!isReady) return;
            dragging = true;
        }}
        on:mousemove={(e) => {
            if (!isReady) return;
            // drag only if primary mouse button is held down
            if (e.buttons === 1) {
                dragging  = true;
                // remove radio pointerDown to prevent radios from triggering on drag
                radioPointerDown = false;
                
                tapes.scrollLeft = tapes.scrollLeft - e.movementX;
            } else {
                dragging = false;
            }
        }}
        on:mouseup={() => {
            if (!isReady) return;
            dragging = false;
        }}>

        <div class="tapePadding">
            <div class="arrowsContainer">
                <TapeArrows />
            </div>
        </div>

        <form class="tapes" on:submit|preventDefault>
            <!-- tape marks above tapes -->
            <div class="tapeMarkers">
                {#each melody as _}
                    <div class="subdiv"></div>
                {/each}
            </div>

            <Tape
                tapeName = "melody"
                tape = {melody}
                {notes}
                {currentSubdiv}
                bind:currentTapeName = {currentTapeName}
                {dragging}
                bind:radioPointerDown = {radioPointerDown}
                {isReady} />

            <Tape
                tapeName = "beats"
                tape = {beats}
                {currentSubdiv}
                bind:currentTapeName = {currentTapeName}
                {dragging}
                bind:radioPointerDown = {radioPointerDown}
                {isReady} />

        </form>
        
        <div class="tapePadding end">
            <button
                class="button add"
                disabled={!isReady}
                on:click={() => dispatch('addQuarter')}>
                <span class="visuallyHidden">add 4 sixteenth notes</span>
                <PlusIcon />
            </button>
            <button
                class="button remove"
                disabled={melody.length <= 4}
                on:click={() => dispatch('removeQuarter')}>
                <span class="visuallyHidden">remove 4 sixteenth notes</span>
                <MinusIcon />
            </button>
        </div>
    </div>
</div>



<style lang="scss">
    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .reels {
            // internal variables
            --_clr-scrollbar: var(--clr-200);
        }
    }

    @mixin dark {
        .reels {
            // internal variables
            --_clr-scrollbar: var(--clr-0);
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .reels {
        // internal variables
        --_clr-thumb: var(--clr-500);

        position: sticky;
        top: calc(-1 * (var(--reels-pad-top) + var(--tapeMarker-height)) + var(--border-width-thick));
        z-index: 1000;

        background-color: var(--clr-50);

        transition: transform $cassette-ani-duration $cassette-ani-easing;
        
        // load state
        transform: translateY(calc(-1 * var(--reels-height) - var(--tapeMarker-height) + var(--cassettTop-translateY)));

        &::before, &::after {
            // playhead
            content: "";
            pointer-events: none;
            position: absolute;
            background-color: var(--clr-red);
        }

        &::before {
            // playhead circle
            --_size: 10px;

            top: calc(var(--reels-pad-top) + 0.5 * var(--tapeMarker-height) - 0.5 * var(--_size));
            left: calc(50% - 0.5 * var(--_size));
            width: var(--_size);
            height: var(--_size);
            z-index: 1001;

            border-radius: var(--borderRadius-round);
        }
        
        &::after {
            // playhead bar
            top: calc(var(--reels-pad-top) + 0.5 * var(--tapeMarker-height));
            bottom: -8px;
            left: calc(50% - 0.5 * var(--border-width-thick) - var(--border-width-thin));
            width: calc(var(--border-width-thick) + 2 * var(--border-width-thin));
            z-index: 1000;
            
            border: solid var(--border-width-thin) var(--clr-0);
            box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.2);

            // load state
            opacity: 0;

            transition: opacity $cassette-ani-duration $cassette-ani-easing;
        }
    }

    .cassette {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        padding: 0 $page-pad-hrz;

        .housing {
            position: relative;
            max-width: $cassetts-maxWidth;
            height: 100%;

            background-color: var(--clr-100);
            border-color: var(--clr-cassette-border);
            border-right-style: solid;
            border-right-width: var(--border-width-thick);
            border-left-style: solid;
            border-left-width: var(--border-width-thick);
            margin: 0 auto;

            &::before {
                // highlight
                content: "";
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;

                background-color: var(--clr-cassette-bg);
                border-right: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
                border-left: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
            }
        }
    }

    .spools {
        display: flex;
        flex-flow: row nowrap;
        position: relative;

        cursor: grab;

        padding: var(--reels-pad-top) 0 var(--border-width-thick) 0;
        overflow-x: auto;

        scrollbar-width: thin;
        scrollbar-color: var(--_clr-thumb) var(--_clr-scrollbar);

        // load state
        opacity: 0;

        transition: opacity $cassette-ani-duration $cassette-ani-easing;

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

    .tapePadding {
        flex-shrink: 0;
        position: relative;
        width: 50%;

        .arrowsContainer {
            position: absolute;
            top: var(--tapeMarker-height);
            right: calc(var(--tapeTerminal-start-width) + var(--noteMarker-width) + var(--pad-md));
            width: 30px;

            color: var(--clr-350);
        }

        &.end {
            // internal variables
            --_width: 44px;
            --_height: 60px;

            // add and remove buttons at the end of the tapes
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: var(--pad-sm);

            padding-top: var(--tapeMarker-height);
            // prevent buttons from being blocked by tape terminals
            padding-left: calc(var(--tapeTerminal-end-width) + var(--pad-md));

            button {
                width: var(--_width);
                height: var(--_height);

                &.add, &.add::before {
                    border-radius: 
                        calc(0.5 * var(--_width))
                        calc(0.5 * var(--_width))
                        var(--borderRadius-sm)
                        var(--borderRadius-sm);
                }

                &.remove, &.remove::before {
                    border-radius: 
                        var(--borderRadius-sm)
                        var(--borderRadius-sm)
                        calc(0.5 * var(--_width))
                        calc(0.5 * var(--_width));
                }
            }
        }
    }

    .tapeMarkers {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), var(--subdivWidth));
        height: var(--tapeMarker-height);

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

    .reels.isReady {
        // default state
        transform: translateY(0);

        &::after {
            // default state
            opacity: 1;
        }

        .spools {
            // default state
            opacity: 1;
        }
    }

    /* === COLOR SCHEME ======================= */
    :global([data-colorScheme="dark"]) { @include dark; }

    @media (prefers-color-scheme: dark) {
        @include dark;

        :global([data-colorScheme="light"]) {
            @include light;
        }
    }

    /* === A11Y =============================== */
    @media (prefers-reduced-motion: reduce) {
        .reels {
            // laod state
            transform: translateY(0);

            &::after {
                // load state
                opacity: 1;
            }
        }
    }
</style>