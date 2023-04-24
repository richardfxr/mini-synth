<script lang="ts">
    /* === IMPORTS ============================ */
    import type * as Tone from 'tone';
    import type { TrackName, Track } from '$lib/synth.svelte';

    /* === PROPS ============================== */
    export let trackName: TrackName;
    export let track: Track;
    export let notes: Tone.Unit.Frequency[] = [];
    export let currentSubdiv: number;
    export let currentTrack: TrackName; // bind
</script>



<article
    id={trackName}
    class="track"
    class:active={currentTrack === trackName}>

    <!-- invisible radio input that covers the whole track -->
    <label>
        <input
            class="visuallyHidden"
            type="radio"
            bind:group={currentTrack}
            name="track"
            value={trackName}>
        <span class="visuallyHidden">Melody track</span>
    </label>

    <!-- start track terminal -->
    <div class="trackTerminal start">⇥</div>

    <!-- vertical note markers -->
    <div class="noteMarkers">
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
    </div>

    {#if trackName === "melody"}
        <!-- melody subdivs -->
        {#each track as subdiv, i}
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
    {:else}
        <!-- beats subdivs -->
        {#each track as subdiv, i}
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
    {/if}

    <!-- end track terminal -->
    <div class="trackTerminal end">
        <div class="repeatDots"></div>
        <div class="repeatLine"></div>
    </div>
</article>



<style lang="scss">
    .track {
        // internal variables
        --_clr-border: var(--clr-350);
        --_trackTerminal-start-width: 25px;
        --_trackTerminal-end-width: 20px;
        --_noteMarker-width: 8px;
        --_note-height: 22px;
        --_repeatDots-size: 5px;

        display: grid;
        grid-template-columns:
            var(--_trackTerminal-start-width)
            var(--_noteMarker-width)
            repeat(var(--melodyLength), var(--subdivWidth))
            var(--_trackTerminal-end-width);
        background-color: var(--clr-100);
        position: relative;
        z-index: 2;

        border-bottom: solid var(--border-width) var(--_clr-border);
        // offset trackTerminal at each end
        margin-right: calc(-1 * var(--_trackTerminal-end-width));
        margin-left: calc(-1 * (var(--_trackTerminal-start-width) + var(--_noteMarker-width)));

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

        &.start {
            background-color: var(--_clr-border);
            transition: background-color var(--trans-fast) ease;
        }

        &.end {
            flex-direction: row;
            gap: 3px;

            border-left: dashed calc(0.5 * var(--border-width-thick)) var(--clr-150);
            border-right: solid 4px var(--_clr-border);

            transition: border-color var(--trans-fast) ease;

            .repeatDots {
                position: relative;
                height: calc(2 * var(--_repeatDots-size) + 6px);
                width: var(--_repeatDots-size);

                &::before, &::after {
                    // dots
                    content: "";
                    position: absolute;
                    right: 0;
                    left: 0;
                    height: var(--_repeatDots-size);

                    background-color: var(--_clr-border);
                    border-radius: var(--borderRadius-round);

                    transition: background-color var(--trans-fast) ease;
                }

                &::before {
                    // top dot
                    top: 0;
                }

                &::after {
                    // bottom dot
                    bottom: 0;
                }
            }

            .repeatLine {
                height: 100%;

                border-right: solid var(--border-width) var(--_clr-border);
            }
        }
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
</style>