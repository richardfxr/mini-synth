<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type { Tweened } from 'svelte/motion';
    import type * as Tone from 'tone';
    import Sprocket from '$lib/SVGs/sprocket.svelte';

    /* === PROPS ============================== */
    export let playbackState: Tone.PlaybackState;
    export let currentSubdiv: number;
    export let tweenedProgress: Tweened<number>;
    export let playbackProgress: number;
    export let melodyLength: number;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
</script>



<div
    class="controls"
    class:playing={playbackState === "started"}
    style="--_sprocket-rotation: {-1 * $tweenedProgress}deg">
    <div class="timecode">
        <p>{Math.floor(currentSubdiv / 16)}:{Math.floor(currentSubdiv / 4) % 4}:{currentSubdiv % 4}</p>
    </div>

    <div class="playback">
        <button
            class="small sprocket"
            style="--_spool-scale: {1.1 + playbackProgress * 1.4}"
            on:click = {() => dispatch('skipToBeginning')}
            disabled = {playbackState === "started" || currentSubdiv <= 0}>
            <p>⇤</p>
            <Sprocket />
        </button>

        <button
            id="prevSubdiv"
            class="small"
            on:click = {() => dispatch('prevSubdiv')}
            disabled = {playbackState === "started" || currentSubdiv <= 0}>
            ←
        </button>

        <button class="main" on:click={() => {
            playbackState === "started" ? dispatch('pause') : dispatch('play')
        }}>
            {#if playbackState === "started"}
                <span>Pause</span>
            {:else}
                <span>Play</span>
            {/if}
        </button>

        <button
            id="nextSubdiv"
            class="small"
            on:click = {() => dispatch('nextSubdiv')}
            disabled = {playbackState === "started" || currentSubdiv >= melodyLength - 1}>
            →
        </button>

        <button
            class="small sprocket"
            style="--_spool-scale: {2.5 - playbackProgress * 1.4}"
            on:click = {() => dispatch('skipToEnd')}
            disabled = {playbackState === "started" || currentSubdiv >= melodyLength - 1}>
            <p>⇥</p>
            <Sprocket />
        </button>
    </div>

    <div class="subdivIndicators">
        <div class:active={playbackState === "started"}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 1}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 2}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 3}></div>
    </div>
</div>



<style lang="scss">
    .controls {
        // internal variables
        --_button-size: 38px;

        display: flex;
        flex-direction: column;
        align-items: center;

        padding-bottom: 10px;
    }

    .timecode {
        position: relative;
        z-index: 2;

        background-color: var(--clr-100);
        padding: 10px var(--pad-md) 0 var(--pad-md);
        margin-bottom: -5px;

        p {
            font-family: 'Cousine', monospace;
            font-weight: 400;
        }
    }

    .playback {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 4px;

        padding: 6px;
        border: solid var(--border-width) var(--clr-250);
        border-radius: var(--borderRadius-round);

        overflow: hidden;
        transition: border-color 0.15s ease;

        button {
            position: relative;
            height: var(--_button-size);

            background-color: var(--clr-100);
            padding-top: 10px;
            padding-bottom: 10px;
            border: solid var(--border-width) var(--clr-250);
            border-radius: 200px;

            &.main {
                width: 90px;
                color: red;
                z-index: 2;
            }

            &.small {
                width: var(--_button-size);
                padding-left: 10px;
                padding-right: 10px;
            }

            &.sprocket {
                transition: scale 0.2s ease;
                z-index: 1;
                border: none;

                &::before {
                    // spool
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -2;

                    background-color: #ececec;
                    border-radius: var(--borderRadius-round);

                    transition: scale 0.1s ease;
                }

                &::after {
                    // fake background and border
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -1;

                    background-color: var(--clr-100);
                    border: solid var(--border-width) var(--clr-250);
                    border-radius: var(--borderRadius-round);
                }

                p {
                    transition: opacity 0.25s ease;
                }

                :global(svg#sprocket) {
                    opacity: 0;
                }
            }

            &#prevSubdiv, &#nextSubdiv {
                transition: transform 0.2s ease,
                            opacity 0.2s ease;
            }
        }
    }

    .playing .playback {
        border-color: var(--clr-800);

        button {
            &.sprocket {
                scale: 1.22;

                &::before {
                    scale: var(--_spool-scale);
                }

                p {
                    opacity: 0;
                }

                :global(svg#sprocket) {
                    opacity: 1;
                    transform: rotate(var(--_sprocket-rotation));
                }
            }

            &#prevSubdiv {
                transform: translateX(10px);
                opacity: 0;
            }

            &#nextSubdiv {
                transform: translateX(-10px);
                opacity: 0;
            }
        }
    }

    .subdivIndicators {
        display: flex;
        flex-direction: row;
        gap: 4px;

        background-color: var(--clr-100);
        padding: 0 4px;
        margin-top: calc(-1 * var(--border-width));

        & > div {
            width: 13px;
            height: var(--border-width);
            background-color: var(--clr-250);
            transition: background-color 0.15s ease;

            &.active {
                background-color: var(--clr-800);
            }
        }
    }
</style>