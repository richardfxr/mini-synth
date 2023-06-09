<script lang="ts">
    /* === IMPORTS ============================ */
    import type * as Tone from 'tone';
    import type { TapeName, Tape } from '../storage/db';
    // icons
    import PianoIcon from '$lib/SVGs/pianoIcon.svelte';
    import BeatsIcons from '$lib/SVGs/beatsIcons.svelte';
    import HighHatIcon from '$lib/SVGs/highHatIcon.svelte';
    import KickDrumIcon from '$lib/SVGs/kickDrumIcon.svelte';
    import SnareDrumIcon from '$lib/SVGs/snareDrumIcon.svelte';
    import TomDrum1Icon from '$lib/SVGs/tomDrum1Icon.svelte';
    import TomDrum2Icon from '$lib/SVGs/tomDrum2Icon.svelte';
    import TomDrum3Icon from '$lib/SVGs/tomDrum3Icon.svelte';

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



<article
    id={tapeName}
    class="tape"
    class:active={currentTapeName === tapeName}
    class:dragging
    class:isReady
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

    <!-- visually hidden radio input for track switching -->
    <label class="visuallyHidden">
        <input
            type="radio"
            name="tape"
            value={tapeName}
            bind:group={currentTapeName}
            disabled={!isReady}>
        {tapeName} tape
    </label>

    <!-- start tape terminal -->
    <div class="tapeTerminal start">
        {#if tapeName === "melody"}
            <PianoIcon />
        {:else}
            <BeatsIcons />
        {/if}
    </div>

    <!-- vertical note markers -->
    <div class="noteMarkers">
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
        <div class="noteMarker"></div>
    </div>

    {#if tapeName === "melody"}
        <!-- melody subdivs -->
        {#each tape as subdiv, i}
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
        {#each tape as subdiv, i}
            <div
                class="subdiv"
                class:active={i === currentSubdiv}>
                {#each subdiv as beat}
                    <p class="beat-{beat}">
                        {#if beat === "hh"}
                            <span class="visuallyHidden">high hat</span>
                            <HighHatIcon />
                        {:else if beat === "kc"}
                            <span class="visuallyHidden">kick drum</span>
                            <KickDrumIcon />
                        {:else if beat === "sn"}
                            <span class="visuallyHidden">snare drum</span>
                            <SnareDrumIcon />
                        {:else if beat === "t1"}
                            <span class="visuallyHidden">tom drum 1</span>
                            <TomDrum1Icon />
                        {:else if beat === "t2"}
                            <span class="visuallyHidden">tom drum 2</span>
                            <TomDrum2Icon />
                        {:else if beat === "t3"}
                            <span class="visuallyHidden">tom drum 3</span>
                            <TomDrum3Icon />
                        {/if}
                    </p>
                {/each}
            </div>
        {/each}
    {/if}

    <!-- end tape terminal -->
    <div class="tapeTerminal end">
        <div class="repeatDots"></div>
        <div class="repeatLine"></div>
    </div>
</article>



<style lang="scss">
    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .tape {
            // internal variables
            --_clr-border: var(--clr-350);

            &#melody {
                border-bottom: solid var(--border-width) var(--clr-800);
            }

            &.active {
                // internal variables
                --_clr-border: var(--clr-800);
            }
        }
    }

    @mixin dark {
        .tape {
            // internal variables
            --_clr-border: var(--clr-500);

            &#melody {
                border-bottom: solid var(--border-width) var(--clr-1000);
            }

            &.active {
                // internal variables
                --_clr-border: var(--clr-1000);
            }
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .tape {
        // internal variables
        --_note-height: 22px;
        --_repeatDots-size: 5px;

        display: grid;
        grid-template-columns:
            var(--tapeTerminal-start-width)
            var(--noteMarker-width)
            repeat(var(--melodyLength), var(--subdivWidth))
            var(--tapeTerminal-end-width);
        background-color: var(--clr-100);
        position: relative;
        z-index: 2;

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
            border-top: solid var(--border-width) var(--_clr-border);
        }

        &#beats {
            height: var(--beats-height);
        }

        &.active .subdiv p {
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

    /* === COLOR SCHEME ======================= */
    :global([data-colorScheme="dark"]) { @include dark; }

    @media (prefers-color-scheme: dark) {
        @include dark;

        :global([data-colorScheme="light"]) {
            @include light;
        }
    }
</style>