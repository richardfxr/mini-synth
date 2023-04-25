<script lang="ts">
    /* === PROPS ============================== */
    export let bpm: number; // bind
    export let layout: "responsive" | "horizontal" = "responsive";

    /* === CONSTANTS ========================== */
    const min = 60;
    const max = 185;
</script>



<div class="sliderWrapper {layout}">
    <input
        type="range"
        id="rangeInput"
        name="beats per minute"
        bind:value={bpm}
        on:input
        {min}
        {max}
        step="1">
    <div class="controls">
        <button
            class="button"
            style="--_dir: 1"
            disabled={bpm <= min}
            on:click={() => {if (bpm > min) bpm--;}}>
            <span class="visuallyHidden">decrease 1 BPM</span>
            -
        </button>
        <label for="rangeInput">
            <span id="bpm">BPM: </span>
            <span id="number">{bpm}</span>
        </label>
        <button
            class="button"
            style="--_dir: -1"
            disabled={bpm >= max}
            on:click={() => {if (bpm < max) bpm++;}}>
            <span class="visuallyHidden">increase 1 BPM</span>
            +
        </button>
    </div>
    
</div>



<style lang="scss">
    .sliderWrapper {
        // internal variables
        --_clr-track: var(--clr-150);
        --_clr-track-progress: red;
        --_clr-thumb: red;
        --_track-width: 100%;
        --_track-height: var(--border-width);
        --_thumb-height: 20px;
        --_thumb-width: 10px;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--pad-sm);
        width: 100%;

        padding: var(--pad-xl) var(--pad-3xl) var(--pad-2xl) var(--pad-3xl);
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

        animation: opacityLoad var(--trans-slow) ease 1;
        animation-delay: var(--ani-delay-load);
        animation-fill-mode: backwards;
        
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
            animation: buttonLoad var(--trans-slow) cubic-bezier(0, .36, .34, 1) 1;
            animation-delay: var(--ani-delay-load);
            animation-fill-mode: backwards;
        }

        label {
            animation: opacityLoad var(--trans-slow) ease 1;
            animation-delay: var(--ani-delay-load);
            animation-fill-mode: backwards;
            
            span {
                display: inline-block;
            }

            #number {
                width: 3ch;
                text-align: center;
            }
        }
    }

    

    /* === ANIMATIONS ========================= */
    @keyframes opacityLoad {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes buttonLoad {
        from {
            transform: translateX(calc(var(--_dir) * 25px));
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>