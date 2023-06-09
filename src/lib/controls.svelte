<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type { Tweened } from 'svelte/motion';
    import type * as Tone from 'tone';
    // icons
    import SkipToStartIcon from '$lib/SVGs/skipToStartIcon.svelte';
    import PrevSubdiv from '$lib/SVGs/prevSubdiv.svelte';
    import PlayIcon from '$lib/SVGs/playIcon.svelte';
    import PuaseIcon from '$lib/SVGs/puaseIcon.svelte';
    import NextSubdivIcon from '$lib/SVGs/nextSubdivIcon.svelte';
    import SkipToEndIcon from '$lib/SVGs/skipToEndIcon.svelte';
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
        <p>{Math.floor((currentSubdiv + 1) / 16)}:{Math.floor((currentSubdiv + 1) / 4) % 4}:{(currentSubdiv + 1) % 4}</p>
    </div>

    <div class="playbackWrapper">
        <div class="playback">
            <button
                class="button small skip"
                style="
                    --_dir: 1;
                    --_spool-scale: {1.1 + playbackProgress * 1.4};
                "
                disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
                on:click = {() => dispatch('skipToBeginning')}>
                <span class="visuallyHidden">skip to start of track</span>
                <div class="spool"></div>
                <SkipToStartIcon />
                <Sprocket />
            </button>

            <button
                class="button small subdiv"
                style="--_dir: 1"
                disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
                on:click = {() => dispatch('prevSubdiv')}>
                <span class="visuallyHidden">previous subdivision</span>
                <PrevSubdiv />
            </button>

            <button
                class="button main warn"
                disabled = {!isReady}
                on:click={() => {playbackState === "started" ? dispatch('pause') : dispatch('play')}}>
                {#if playbackState === "started"}
                    <span class="visuallyHidden">pause</span>
                    <PuaseIcon />
                {:else}
                    <span class="visuallyHidden">play</span>
                    <PlayIcon />
                {/if}
            </button>

            <button
                class="button small subdiv"
                style="--_dir: -1"
                disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
                on:click = {() => dispatch('nextSubdiv')}>
                <span class="visuallyHidden">next subdivision</span>
                <NextSubdivIcon />
            </button>

            <button
                class="button small skip"
                style="
                    --_dir: -1;
                    --_spool-scale: {2.5 - playbackProgress * 1.4};
                "
                disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
                on:click = {() => dispatch('skipToEnd')}>
                <span class="visuallyHidden">skip to end of track</span>
                <div class="spool"></div>
                <SkipToEndIcon />
                <Sprocket />
            </button>
        </div>
    </div>
    
</div>



<style lang="scss">
    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .playback {
            background-color: var(--clr-200);
            border-color: var(--clr-300);

            .button {
                --_clr-border: var(--clr-400);

                &:hover {
                    --_clr-border: var(--clr-600);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-700);
                }
            
                &:disabled {
                    --_clr-border: var(--clr-250);
                }

                &.skip {
                    .spool {
                        background-color: var(--clr-500);
                        box-shadow: 0 0 7px 0 rgba(0, 0, 0, 0.15);
                    }

                    :global(svg.sprocket) {
                        fill: var(--clr-50);
                        stroke: var(--clr-300);
                    }
                } 
            }
        } 
        
        .controls.isReady.playing .playback {
            border-color: var(--clr-700);

            button.skip {
                --_clr-border: var(--clr-700);
            }
        }
    }

    @mixin dark {
        .playback {
            background-color: var(--clr-50);
            border-color: var(--clr-0);

            .button {
                --_clr-border: var(--clr-0);

                &:hover {
                    --_clr-border: var(--clr-0);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-0);
                }
            
                &:disabled {
                    --_clr-border: var(--clr-50);
                }

                &.skip {
                    .spool {
                        background-color: var(--clr-0);
                        box-shadow: 0 0 7px 0 rgba(0, 0, 0, 0.5);
                    }

                    :global(svg.sprocket) {
                        fill: var(--clr-50);
                        stroke: var(--clr-350);
                    }
                } 
            }
        } 
        
        .controls.isReady.playing .playback {
            border-color: var(--clr-0);

            button.skip {
                --_clr-border: var(--clr-600);
            }
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .controls {
        // internal variables
        --_button-size: 44px;

        display: flex;
        flex-direction: column;
        align-items: center;
        position: sticky;
        top: var(--reels-height);
        z-index: 2;

        background-color: var(--clr-100);
        border-radius:
            0
            0
            $cassette-border-radius
            $cassette-border-radius;
        margin: 0 3px;
    }

    .timecode {
        position: relative;
        z-index: 2;

        padding: 10px var(--pad-md) var(--pad-sm) var(--pad-md);

        p {
            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
        }
    }

    .playbackWrapper {
        padding-bottom: $cassette-shading-size;
        background-color: var(--clr-cassette-bg-highlight);
        border-radius: var(--borderRadius-round);
    }

    .playback {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 2px;
        position: relative;

        padding: 6px;
        border-style: solid;
        border-width: var(--border-width-thick);
        border-radius: var(--borderRadius-round);

        overflow: hidden;
        transition: border-color 0.2s ease;

        // prevent buttons from overflowing on iOS 15 Safari
        // by establishing new stacking order
        isolation: isolate;

        .button {
            &.main {
                width: 90px;
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
                transition: color var(--trans-normal) ease,
                            scale var(--trans-normal) ease,
                            transform var(--trans-normal) var(--trans-cubic-1),
                            opacity var(--trans-normal) var(--trans-cubic-1);

                // load state
                transform: translateX(calc(var(--_dir) * 50px));
                opacity: 0;

                &::before {
                    // fake background and border to go above spool (::before)
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -1;

                    background-color: var(--_clr-highlight);
                    border: solid var(--border-width-thick) var(--_clr-border);
                    border-radius: var(--borderRadius-round);

                    transition: background-color var(--trans-normal) ease,
                                border-color var(--trans-normal) ease;
                }

                &::after {
                    // main color
                    content: "";
                    position: absolute;
                    top: calc(var(--border-width-thick) + $highlight-height);
                    right: calc(var(--border-width-thick) + 0.5 * $highlight-height);
                    bottom: var(--border-width-thick);
                    left: calc(var(--border-width-thick) + 0.5 * $highlight-height);

                    background-color: var(--_clr-background);
                    border-radius: var(--borderRadius-round);
                    transform: translateY(0);

                    transition: background-color var(--trans-normal) ease,
                                transform var(--trans-normal) ease,
                                opacity var(--trans-normal) ease;
                }

                &:active, &.active {
                    &::before {
                        // override default .button ::before transform
                        transform: none;
                    }

                    &::after {
                        // add default .button ::before transform to ::after
                        transform: translateY(-$highlight-height);
                    }
                }

                .spool {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -2;

                    border-radius: var(--borderRadius-round);

                    opacity: 0;

                    transition: opacity var(--trans-fastest) ease,
                                scale var(--trans-fastest) ease;
                }

                :global(.icon) {
                    position: relative;
                    z-index: 1;
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

    .controls.isReady {
        .playback .button {
            &.skip, &.subdiv {
                // default state
                transform: translateX(0);
                opacity: 1;
            }
        }

        &.playing .playback {
            button {
                &.skip {                    
                    color: var(--_clr-border);
                    scale: 1.21;

                    &::after {
                        opacity: 0;
                    }

                    .spool {
                        opacity: 1;
                        scale: var(--_spool-scale);
                    }

                    :global(.icon) {
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

    /* === COLOR SCHEME ======================= */
    :global([data-colorScheme="dark"]) { @include dark; }

    @media (prefers-color-scheme: dark) {
        @include dark;

        :global([data-colorScheme="light"]) {
            @include light;
        }
    }
</style>