<script lang="ts">
    import type { Tweened } from 'svelte/motion';
    /* === IMPORTS ============================ */
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let tweening: boolean;
    export let tweenedProgress: Tweened<number>;
    export let subdivWidth: number;
    export let currentSubdiv: number; // bind
    export let melody: Tone.Unit.Frequency[][];
    export let hasManuallyScrolled: boolean; // bind

    tweenedProgress.subscribe(() => {
        // set scrollLeft using progress (tweened)
        if (tweening) {
            // console.log("progress: " + $progress);
            tapes.scrollLeft = $tweenedProgress;
        }
    });

    /* === VARIABLES ========================== */
    let tapes: HTMLElement;
</script>



<div class="reels">
    <div
        class="tapes"
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
                        <p>{note}</p>
                    {/each}
                </div>
            {/each}
        </div>
        <div class="trackPadding"></div>
    </div>
</div>



<style lang="scss">
    .reels {
        position: relative;
        padding: 10px 0;
        
        &::before {
            // playhead
            content: "";
            pointer-events: none;
            position: absolute;
            top: 0;
            bottom: 0;
            left: calc(50% - 0.5px);
            width: 1px;
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
    }

    .trackPadding {
        width: 50%;
        flex-shrink: 0;
    }

    .tracks {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), 50px);
        background-color: var(--clr-100);

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

                background-color: var(--clr-800);
                padding: 3px;
                border-radius: 2px;
            }
        }
    }
</style>