<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type { Tweened } from 'svelte/motion';
    import type * as Tone from 'tone';
    // helpers
    import { stopPropagation } from '$lib/helpers';
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

    /* === VARIABLES ========================== */
    let skipToBeginningKbActive = false;
    let prevSubdivKbActive = false;
    let playbackKbActive = false;
    let nextSubdivKbActive = false;
    let skipToEndKbActive = false;

    /* === FUNCTIONS ========================== */
    function togglePlayback(): void {
        playbackState === 'started' ? dispatch('pause') : dispatch('play');
    }

    function handleKeyDown(e: KeyboardEvent): void {
        console.log("key: " + e.code);
        switch(e.code) {
            case 'Space':
                playbackKbActive = true;
                togglePlayback();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    skipToBeginningKbActive = true;
                    dispatch('skipToBeginning');
                } else {
                    prevSubdivKbActive = true;
                    dispatch('prevSubdiv');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    skipToEndKbActive = true;
                    dispatch('skipToEnd');
                } else {
                    nextSubdivKbActive = true;
                    dispatch('nextSubdiv');
                }
                break;
        }
    }

    function handleKeyUp(e: KeyboardEvent): void {
        switch(e.code) {
            case 'Space':
                playbackKbActive = false;
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    skipToBeginningKbActive = false;
                } else {
                    prevSubdivKbActive = false;
                }
                break;
            case 'ArrowRight':
                if (e.shiftKey) {
                    skipToEndKbActive = false;
                } else {
                    nextSubdivKbActive = false;
                }
                break;
        }
    }
</script>



<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div
    class="controls"
    class:playing={playbackState === "started"}
    class:isReady
    style="--_sprocket-rotation: {-1 * $tweenedProgress}deg">
    <div class="timecode">
        {#if playbackState === "started"}
            <p>
                <span class="visuallyHidden">bar </span>{Math.floor(currentSubdiv / 16)}:<span class="visuallyHidden">beat </span>{Math.floor(currentSubdiv / 4) % 4}:{currentSubdiv % 4}<span class="visuallyHidden"> sixteenth</span>
            </p>
        {:else}
            <p>
                <span aria-live="polite" aria-atomic="true"><span class="visuallyHidden">bar </span>{Math.floor(currentSubdiv / 16)}</span>:<span aria-live="polite" aria-atomic="true"><span class="visuallyHidden">beat </span>{Math.floor(currentSubdiv / 4) % 4}</span>:<span aria-live="polite" aria-atomic="true">{currentSubdiv % 4}<span class="visuallyHidden"> sixteenth</span></span>
            </p>
        {/if}
    </div>

    <div class="playbackWrapper">
        <div class="playback">
            <button
                class="button small skip"
                class:kbActive={skipToBeginningKbActive}
                style="
                    --_dir: 1;
                    --_spool-scale: {1.1 + playbackProgress * 1.4};
                "
                disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
                aria-controls="melody beats"
                aria-keyshortcuts="Shift+LeftArrow"
                on:click = {() => dispatch('skipToBeginning')}
                on:keydown={e => stopPropagation(e, ['Space'])}>
                <span class="visuallyHidden">skip to start of track</span>
                <div class="spool"></div>
                <SkipToStartIcon />
                <Sprocket />
            </button>

            <button
                class="button small subdiv"
                class:kbActive={prevSubdivKbActive}
                style="--_dir: 1"
                disabled = {!isReady || playbackState === "started" || currentSubdiv <= 0}
                aria-controls="melody beats"
                aria-keyshortcuts="LeftArrow"
                on:click = {() => dispatch('prevSubdiv')}
                on:keydown={e => stopPropagation(e, ['Space'])}>
                <span class="visuallyHidden">previous sixteenth</span>
                <PrevSubdiv />
            </button>

            <button
                class="button main warn"
                class:kbActive={playbackKbActive}
                disabled = {!isReady}
                aria-controls="melody beats"
                aria-keyshortcuts="Space"
                on:click={togglePlayback}
                on:keydown={e => stopPropagation(e, ['Space'])}>
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
                class:kbActive={nextSubdivKbActive}
                style="--_dir: -1"
                disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
                aria-controls="melody beats"
                aria-keyshortcuts="ArrowRight"
                on:click = {() => dispatch('nextSubdiv')}
                on:keydown={e => stopPropagation(e, ['Space'])}>
                <span class="visuallyHidden">next sixteenth</span>
                <NextSubdivIcon />
            </button>

            <button
                class="button small skip"
                class:kbActive={skipToEndKbActive}
                style="
                    --_dir: -1;
                    --_spool-scale: {2.5 - playbackProgress * 1.4};
                "
                disabled = {!isReady || playbackState === "started" || currentSubdiv >= melodyLength - 1}
                aria-controls="melody beats"
                aria-keyshortcuts="Shift+ArrowRight"
                on:click = {() => dispatch('skipToEnd')}
                on:keydown={e => stopPropagation(e, ['Space'])}>
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

                &:hover, &:focus {
                    --_clr-border: var(--clr-600);
                }

                &:focus-visible {
                    --_clr: var(--clr-1000);
                    --_clr-border: var(--clr-focus-red);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-700);
                }
            
                &:disabled, &.kbActive:disabled {
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

                &.kbActive {
                    --_clr-border: var(--clr-700);
                }

                &.warn:focus-visible {
                    --_clr: var(--clr-red-hover);
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

                &:hover, &:focus {
                    --_clr-border: var(--clr-0);
                }

                &:focus-visible {
                    --_clr: var(--clr-1000);
                    --_clr-border: var(--clr-focus-red);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-0);
                }
            
                &:disabled, &.kbActive:disabled {
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
                
                &.kbActive {
                    --_clr-border: var(--clr-0);
                }

                &.warn:focus-visible {
                    --_clr: var(--clr-red-hover);
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
        display: flex;
        flex-direction: column;
        align-items: center;
        position: sticky;
        top: $reels-height;
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

        padding: 10px $pad-md $pad-sm $pad-md;

        p, p span {
            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
        }
    }

    .playbackWrapper {
        padding-bottom: $cassette-shading-size;
        background-color: var(--clr-cassette-bg-highlight);
        border-radius: $borderRadius-round;
    }

    .playback {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 2px;
        position: relative;

        padding: 6px;
        border-style: solid;
        border-width: $border-width-thick;
        border-radius: $borderRadius-round;

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
                width: $button-minSize;
                padding-left: 10px;
                padding-right: 10px;
            }

            &.skip {
                z-index: 1;
                border: none;
                transition: color $trans-normal ease,
                            scale $trans-normal ease,
                            transform $trans-normal $trans-cubic-1,
                            opacity $trans-normal $trans-cubic-1;

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
                    border: solid $border-width-thick var(--_clr-border);
                    border-radius: $borderRadius-round;

                    transition: background-color $trans-normal ease,
                                border-color $trans-normal ease;
                }

                &::after {
                    // main color
                    content: "";
                    position: absolute;
                    top: calc($border-width-thick + $highlight-height);
                    right: calc($border-width-thick + 0.5 * $highlight-height);
                    bottom: $border-width-thick;
                    left: calc($border-width-thick + 0.5 * $highlight-height);

                    background-color: var(--_clr-background);
                    border-radius: $borderRadius-round;
                    transform: translateY(0);

                    transition: background-color $trans-normal ease,
                                transform $trans-normal ease,
                                opacity $trans-normal ease;
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

                    border-radius: $borderRadius-round;

                    opacity: 0;

                    transition: opacity $trans-fastest ease,
                                scale $trans-fastest ease;
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

                transition: background-color $trans-normal ease,
                            border-color $trans-normal ease,
                            transform $trans-normal $trans-cubic-1,
                            opacity $trans-normal $trans-cubic-1;
                
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

    /* === A11Y =============================== */
    @media (prefers-reduced-motion: reduce) {
        .playback .button {
            &.skip {
                // load state
                transform: translateX(0);
            }
            
            &.subdiv {
                // load state
                transform: translateX(0);
            }
        }
    }
</style>