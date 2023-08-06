<script lang="ts">
    /* === IMPORTS ============================ */
    import type * as Tone from 'tone';
    import type { TapeName, Tape } from '../storage/db';
    import { detailForBeat } from '$lib/soundboard.svelte';
    // icons
    import PianoIcon from '$lib/SVGs/pianoIcon.svelte';
    import BeatsIcons from '$lib/SVGs/beatsIcons.svelte';

    /* === PROPS ============================== */
    export let tapeName: TapeName;
    export let tape: Tape;
    export let notes: Tone.Unit.Frequency[] = [];
    export let currentSubdiv: number;
    export let currentTapeName: TapeName; // bind
    export let dragging: boolean;
    export let radioPointerDown: boolean; // bind
    export let isReady: boolean;
</script>



<!-- visually hidden radio input for track switching -->
<label
    id={tapeName + "-label"}
    for={tapeName + "-radio"}
    class="visuallyHidden">
    {tapeName} tape
</label>

<input
    type="radio"
    id={tapeName + "-radio"}
    class="visuallyHidden tapeRadio"
    name="tape"
    value={tapeName}
    bind:group={currentTapeName}
    disabled={!isReady}>

<article
    id={tapeName}
    class="tape"
    class:active={currentTapeName === tapeName}
    class:dragging
    class:isReady
    aria-labelledby={tapeName + "-label"}
    on:pointerdown={() => {
        // register pointer down event
        // this will be reset if the user drags the reel
        radioPointerDown = true
    }}
    on:pointerup={() => {
        if (radioPointerDown) {
            // check radio if radioPointerDown was registered
            // (user was not simply dragging the reel)
            currentTapeName = tapeName;
        }
        radioPointerDown = false;   
    }}>

    <!-- start tape terminal -->
    <div class="tapeTerminal start">
        {#if tapeName === "melody"}
            <PianoIcon />
        {:else}
            <BeatsIcons />
        {/if}
    </div>

    <!-- vertical note markers -->
    <div class="noteMarkers" aria-hidden="true">
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
    </div>

    <h2 class="visuallyHidden">{tapeName} track</h2>
    
    <ol class="notes">
        {#if tapeName === "melody"}
            <!-- melody subdivs -->
            {#each tape as subdiv, i}
                <li
                    class="subdiv"
                    class:active={i === currentSubdiv}
                    aria-current={i === currentSubdiv}>
                    {#each subdiv as note}
                        <p class="note-{notes.indexOf(note) % 12}">
                            <span><span class="visuallyHidden">note </span>{notes.indexOf(note) + 1}</span>
                        </p>
                    {/each}
                </li>
            {/each}
        {:else}
            <!-- beats subdivs -->
            {#each tape as subdiv, i}
                <li
                    class="subdiv"
                    class:active={i === currentSubdiv}
                    aria-current={i === currentSubdiv}>
                    {#each subdiv as beat}
                        <p class="beat-{beat}">
                            <span class="visuallyHidden">{detailForBeat[beat].text}</span>
                            <svelte:component this={detailForBeat[beat].icon} />
                        </p>
                    {/each}
                </li>
            {/each}
        {/if}
    </ol>

    <!-- end tape terminal -->
    <div class="tapeTerminal end">
        <div class="repeatDots"></div>
        <div class="repeatLine"></div>
    </div>
</article>



<style lang="scss">
    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .tapeRadio:focus-visible + .tape {
            // internal variable
            --_clr-border: var(--clr-focus-red);

            &#melody {
                border-bottom-color: var(--clr-focus-red);
            }
        }
        
        .tape {
            // internal variables
            --_clr-border: var(--clr-350);

            &.active {
                // internal variables
                --_clr-border: var(--clr-800);
            }
        }
    }

    @mixin dark {
        .tapeRadio:focus-visible + .tape {
            // internal variable
            --_clr-border: var(--clr-focus-red);
        }   

        .tape {
            // internal variables
            --_clr-border: var(--clr-500);

            &.active {
                // internal variables
                --_clr-border: var(--clr-1000);
            }
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .tapeRadio:focus-visible + .tape {
        z-index: 3;
    }

    .tape {
        // internal variables
        --_note-height: 22px;
        --_repeatDots-size: 5px;

        display: grid;
        grid-template-columns:
            var(--tapeTerminal-start-width)
            var(--noteMarker-width)
            1fr
            var(--tapeTerminal-end-width);
        background-color: var(--clr-100);
        position: relative;
        z-index: 2;

        border-top: solid var(--border-width) var(--_clr-border);
        border-bottom: solid var(--border-width) var(--_clr-border);
        // offset tapeTerminal at each end
        margin-right: calc(-1 * var(--tapeTerminal-end-width));
        margin-left: calc(-1 * (var(--tapeTerminal-start-width) + var(--noteMarker-width)));

        transition: border-color var(--trans-fast) ease,
                    width 2s ease-in-out;

        // prevent text highlighting on drag
        -webkit-user-select:none;
        user-select: none;

        &#melody {
            height: var(--melody-height);
            margin-bottom: calc(-1 * var(--border-width));
        }

        &#beats {
            height: var(--beats-height);
        }

        &.active {
            z-index: 3;

            .subdiv p {
                color: var(--clr-note-text);

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

        &.dragging label {
            cursor: grabbing;
        }
    }

    .tapeTerminal {
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

    .notes {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), var(--subdivWidth));
        overflow: hidden;

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
                background-color: var(--clr-highlight);
            }

            p {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: var(--_note-height);

                color: var(--clr-note-text-dim);
                text-align: center;
                background-color: var(--clr-note-dim);

                transition: color var(--trans-fast) ease,
                            background-color var(--trans-fast) ease;

                span {
                    display: block;
                    font-size: 17px;
                    font-weight: 600;

                    // move numbers down slightly
                    margin-bottom: -1px;
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