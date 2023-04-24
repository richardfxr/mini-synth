<script lang="ts">
    /* === PROPS ============================== */
    export let bpm: number; // bind
    export let layout: "responsive" | "horizontal" = "responsive";
</script>



<div class="sliderWrapper {layout}">
    <label for="bpm" id="BPMlabel">BPM</label>
    <div class="rangePlaceholder">
        <input
            type="range"
            id="bpm"
            name="beats per minute"
            bind:value={bpm}
            on:input
            min="60"
            max="185"
            step="1">
    </div>
    <label for="bpm">{bpm}</label>
</div>



<style lang="scss">
    .sliderWrapper {
        // internal variables (referencing a vertical range input)
        --_clr-track: var(--clr-150);
        --_clr-track-progress: red;
        --_clr-thumb: red;
        --_track-height: calc(min(var(--inputs-height), var(--inputs-maxHeight)) - 70px);
        --_track-width: 2px;
        --_thumb-width: 20px;
        --_thumb-height: 10px;

        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        gap: 10px;

        &.horizontal {
            // internal variables
            --_track-height: 100%;

            flex-direction: row;
            gap: 10px;
            width: 100%;
            max-width: var(--inputs-maxHeight);

            .rangePlaceholder {
                flex-grow: 1;
                position: relative;
                width: unset;
                height: unset;
            }
            
            #bpm {
                // reset all styling
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                cursor: pointer;

                width: var(--_track-height);
                overflow: hidden;

                // rotate range input to be vertical and adjust location
                position: relative;
                transform-origin: top left;
                top: var(--_track-height);
                transform: rotate(0deg);

                // prevent scroll when draggin range input on touch screen
                touch-action: none;
            }
        }
    }

    .rangePlaceholder {
        flex-grow: 1;
        position: relative;
        width: var(--_thumb-width);
    }
    
    #bpm {
        // reset all styling
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;

        display: block;
        width: var(--_track-height);
        overflow: hidden;

        // rotate range input to be vertical and adjust location
        position: absolute;
        transform-origin: top left;
        top: var(--_track-height);
        transform: rotate(-90deg);

        // prevent scroll when draggin range input on touch screen
        touch-action: none;
        
        &::-webkit-slider-runnable-track {
            position: relative;
            height: var(--_thumb-width);
            background: linear-gradient(var(--_clr-track) 0 0) scroll no-repeat center /
                        100% calc(var(--_track-width));
        }

        &::-webkit-slider-thumb {
            // internal variables
            --_clip-top: calc((var(--_thumb-width) - var(--_track-width)) * 0.5);
            --_clip-bottom: calc(var(--_thumb-width) - var(--_clip-top));
            --_clip-further: calc(100% + 1px);
            
            // reset styling
            -webkit-appearance: none;
            
            position: relative;
            width: var(--_thumb-height);
            height: var(--_thumb-width);

            // box-shadow and clip-path to fake progress color
            background: linear-gradient(var(--_clr-track-progress) 0 0) scroll no-repeat left center /
                        50% calc(var(--_track-width) + 1px);
            background-color: var(--_clr-thumb);
            box-shadow: calc(-100vmax - var(--_thumb-height)) 0 0 100vmax var(--_clr-track-progress);

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
            height: var(--_track-width);
            background-color: var(--_clr-track);
        }

        &::-moz-range-thumb {
            width: var(--_thumb-height);
            height: var(--_thumb-width);
            background-color: var(--_clr-thumb);
            border: none;
            border-radius: 0;
        }

        &::-moz-range-progress {
            height: var(--_track-width);
            background-color: var(--_clr-track-progress);
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .sliderWrapper {
            // internal variables
            --_track-height: 300px;
        }

        .rangePlaceholder {
            height: var(--_track-height);
        }
    }

    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .sliderWrapper {
            // internal variables
            --_track-height: 100%;

            flex-grow: 1;
            flex-direction: row;
            gap: 10px;
        }

        .rangePlaceholder {
            flex-grow: 1;
            position: relative;
            width: unset;
        }
        
        #bpm {
            // reset all styling
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;

            width: var(--_track-height);
            overflow: hidden;

            // rotate range input to be vertical and adjust location
            position: relative;
            transform-origin: top left;
            top: var(--_track-height);
            transform: rotate(0deg);

            // prevent scroll when draggin range input on touch screen
            touch-action: none;
        }
    }
</style>