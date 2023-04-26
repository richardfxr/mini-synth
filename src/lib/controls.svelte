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
    export let isReady: boolean;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
</script>



<div
    class="controls"
    class:playing={playbackState === "started"}
    class:isReady
    style="--_sprocket-rotation: {-1 * $tweenedProgress}deg">
    <div class="timecode">
        <p>{Math.floor(currentSubdiv / 16)}:{Math.floor(currentSubdiv / 4) % 4}:{currentSubdiv % 4}</p>
    </div>

    <div class="playback">
        <button
            class="button small skip"
            style="
                --_dir: 1;
                --_spool-scale: {1.1 + playbackProgress * 1.4};
            "
            disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
            on:click = {() => dispatch('skipToBeginning')}>
            <p>⇤</p>
            <Sprocket />
        </button>

        <button
            class="button small subdiv"
            style="--_dir: 1"
            disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
            on:click = {() => dispatch('prevSubdiv')}>
            ←
        </button>

        <button
            class="button main"
            disabled = {!isReady}
            on:click={() => {playbackState === "started" ? dispatch('pause') : dispatch('play')}}>
            {#if playbackState === "started"}
                <span>Pause</span>
            {:else}
                <span>Play</span>
            {/if}
        </button>

        <button
            class="button small subdiv"
            style="--_dir: -1"
            disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
            on:click = {() => dispatch('nextSubdiv')}>
            →
        </button>

        <button
            class="button small skip"
            style="
                --_dir: -1;
                --_spool-scale: {2.5 - playbackProgress * 1.4};
            "
            disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
            on:click = {() => dispatch('skipToEnd')}>
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
        --_button-size: 44px;

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
        border: solid var(--border-width) var(--clr-150);
        border-radius: var(--borderRadius-round);

        overflow: hidden;
        transition: border-color 0.2s ease;

        .button {
            &.main {
                width: 90px;
                color: red;
                z-index: 3;
            }

            &.small {
                width: var(--_button-size);
                padding-left: 10px;
                padding-right: 10px;
            }

            &.skip {
                z-index: 1;
                border: none;
                transition: scale var(--trans-normal) ease,
                            transform var(--trans-normal) var(--trans-cubic-1),
                            opacity var(--trans-normal) var(--trans-cubic-1);

                // load state
                transform: translateX(calc(var(--_dir) * 50px));
                opacity: 0;

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
                    // fake background and border to go above spool (::before)
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -1;

                    background-color: var(--_clr-background);
                    border: solid var(--border-width) var(--_clr-border);
                    border-radius: var(--borderRadius-round);

                    transition: background-color 0.2s ease,
                                border-color 0.2s ease;
                }

                p {
                    transition: opacity 0.25s ease;
                }

                :global(svg.sprocket) {
                    opacity: 0;
                }
            }

            &.subdiv {
                z-index: 2;

                transition: background-color var(--trans-normal) ease,
                            border-color var(--trans-normal) ease,
                            transform var(--trans-normal) var(--trans-cubic-1),
                            opacity var(--trans-normal) var(--trans-cubic-1);
                
                // load state
                transform: translateX(calc(var(--_dir) * 20px));
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
            background-color: var(--clr-150);
            transition: background-color 0.15s ease;

            &.active {
                background-color: var(--clr-800);
            }
        }
    }

    .controls.isReady {
        .playback .button {
            &.skip, &.subdiv {
                // default state
                transform: translateX(0);
                opacity: 1;
            }
        }

        &.playing .playback {
            border-color: var(--clr-800);

            button {
                &.skip {
                    --_clr-border: var(--clr-250);
                    
                    scale: 1.21;

                    &::before {
                        scale: var(--_spool-scale);
                    }

                    p {
                        opacity: 0;
                    }

                    :global(svg.sprocket) {
                        opacity: 1;
                        transform: rotate(var(--_sprocket-rotation));
                    }
                }

                &.subdiv {
                    transform: translateX(calc(var(--_dir) * 10px));
                    opacity: 0;
                }
            }
        }
    }
</style>