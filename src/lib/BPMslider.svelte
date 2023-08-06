<script lang="ts">
    /* === IMPORTS ============================ */
    // helpers
    import { stopPropagation } from '$lib/helpers';
    // icons
    import MinusIcon from '$lib/SVGs/minusIcon.svelte';
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';

    /* === PROPS ============================== */
    export let bpm: number; // bind
    export let isReady: boolean;

    /* === CONSTANTS ========================== */
    const min = 60;
    const max = 185;

    /* === VARIABLES ========================== */
    let bpmUpKbActive = false;
    let bpmDownKbActive = false;

    /* === FUNCTIONS ========================== */
    function adjustBPM(amount: number): void {
        // clamp bpm to a value between min and max (inclusive)
        bpm = Math.min(Math.max(bpm + amount, min), max);
    }
</script>



<div
    class="sliderWrapper"
    class:isReady>
    <input
        type="range"
        id="rangeInput"
        name="beats per minute"
        bind:value={bpm}
        on:input
        {min}
        {max}
        step="1"
        on:keydown={e => stopPropagation(e, ['ArrowLeft', 'ArrowRight'])}>
    <div class="controls">
        <button
            class="button"
            class:kbActive={bpmDownKbActive}
            style="--_dir: 1"
            disabled={bpm <= min}
            on:click={() => adjustBPM(-1)}
            on:keydown={e => stopPropagation(e, ['Space'])}>
            <span class="visuallyHidden">decrease 1 BPM</span>
            <MinusIcon />
        </button>
        <label for="rangeInput">
            <span id="bpm">BPM: </span>
            <span id="number">{bpm}</span>
        </label>
        <button
            class="button"
            class:kbActive={bpmUpKbActive}
            style="--_dir: -1"
            disabled={bpm >= max}
            on:click={() => adjustBPM(1)}
            on:keydown={e => stopPropagation(e, ['Space'])}>
            <span class="visuallyHidden">increase 1 BPM</span>
            <PlusIcon />
        </button>
    </div>
    
</div>



<style lang="scss">
    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .sliderWrapper {
            // internal variables
            --_clr-track: var(--clr-150);
        }
    }

    @mixin dark {
        .sliderWrapper {
            // internal variables
            --_clr-track: var(--clr-0);
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .sliderWrapper {
        // internal variables
        --_clr-track-progress: var(--clr-red);
        --_clr-thumb: var(--clr-red);
        --_track-width: 100%;
        --_track-height: var(--border-width);
        --_thumb-height: 20px;
        --_thumb-width: 10px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--pad-sm);
        position: relative;
        width: 100%;

        padding: var(--pad-3xl) var(--pad-3xl) var(--pad-xl) var(--pad-3xl);
    }
    
    #rangeInput {
        // reset all styling
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;

        display: block;
        width: var(--_track-width);
        overflow: hidden;

        outline: solid var(--border-width-thick) transparent;

        transition: opacity var(--trans-slow) var(--trans-cubic-1),
                    outline-color var(--trans-fast) ease;

        // load state
        opacity: 0;

        &:focus-visible {
            outline-color: var(--clr-1000);
        }
        
        &::-webkit-slider-runnable-track {
            position: relative;
            height: var(--_thumb-height);
            background: linear-gradient(var(--_clr-track) 0 0) scroll no-repeat center /
                        100% calc(var(--_track-height));
        }

        &::-webkit-slider-thumb {
            // internal variables
            --_clip-top: calc((var(--_thumb-height) - var(--_track-height)) * 0.5);
            --_clip-bottom: calc(var(--_thumb-height) - var(--_clip-top));
            --_clip-further: calc(100% + 1px);
            
            // reset styling
            -webkit-appearance: none;
            
            position: relative;
            width: var(--_thumb-width);
            height: var(--_thumb-height);

            // box-shadow and clip-path to fake progress color
            background: linear-gradient(var(--_clr-track-progress) 0 0) scroll no-repeat left center /
                        50% calc(var(--_track-height) + 1px);
            background-color: var(--_clr-thumb);
            box-shadow: calc(-100vmax - var(--_thumb-width)) 0 0 100vmax var(--_clr-track-progress);

            clip-path: polygon(
                100% -1px,
                0 -1px,
                0 var(--_clip-top),
                -100vmax var(--_clip-top),
                -100vmax var(--_clip-bottom),
                0 var(--_clip-bottom),
                0 100%,
                var(--_clip-further) var(--_clip-further)
            );
        }

        &::-moz-range-track {
            height: var(--_track-height);
            background-color: var(--_clr-track);
        }

        &::-moz-range-thumb {
            width: var(--_thumb-width);
            height: var(--_thumb-height);
            background-color: var(--_clr-thumb);
            border: none;
            border-radius: 0;
        }

        &::-moz-range-progress {
            height: var(--_track-height);
            background-color: var(--_clr-track-progress);
        }
    }

    .controls {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: var(--pad-xl);

        .button {
            transition: transform var(--trans-slow) var(--trans-cubic-1),
                        opacity var(--trans-slow) var(--trans-cubic-1);
                
            // load state
            transform: translateX(calc(var(--_dir) * 25px));
            opacity: 0;
        }

        label {
            transition: opacity var(--trans-slow) var(--trans-cubic-1);

            // load state
            opacity: 0;
            
            span {
                display: inline-block;
            }

            #number {
                width: 3ch;
                text-align: center;
            }
        }
    }

    .sliderWrapper.isReady {
        #rangeInput {
            // default state
            opacity: 1;
        }

        .controls {
            .button {
                // default state
                transform: translateX(0);
                opacity: 1;
            }

            label {
                //defult state
                opacity: 1;
            }
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
        .controls {
            .button {
                // load state
                transform: translateX(0);
            }
        }
    }
</style>