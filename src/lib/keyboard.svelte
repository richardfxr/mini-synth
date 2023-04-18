<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, createEventDispatcher } from 'svelte';
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let currentKbSegment: 0 | 1 | 2;
    export let notes: Tone.Unit.Frequency[];
    export let notesOfSegment: Tone.Unit.Frequency[][];

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let activeNotes: Tone.Unit.Frequency[] = [];
    let keyboard: HTMLElement;
    let isReady = false;
    let isPortrait = false;

    /* === REACTIVE DECLARATION =============== */
    // call scrollToCurrentSegment() when currentKbSegment changes
    $: currentKbSegment ? scrollToCurrentSegment() : scrollToCurrentSegment();

    /* === FUNCTIONS ========================== */
    function checkOrientation(): void {
        isPortrait = window.matchMedia("(orientation: portrait)").matches;
        scrollToCurrentSegment();
    }

    function scrollToCurrentSegment(): void {
        if (!isReady) return;

        const targetSegment = keyboard.children[currentKbSegment] as HTMLElement;

        if (isPortrait) {
            keyboard.scrollTop = Math.min(
                targetSegment.offsetTop,
                targetSegment.offsetHeight * 3 - keyboard.offsetHeight
            );
        } else {
            keyboard.scrollLeft = Math.min(
                targetSegment.offsetLeft,
                targetSegment.offsetWidth * 3 - keyboard.offsetWidth
            );
        }
    }

    function handleKeyDown(note: Tone.Unit.Frequency): void {
        if (activeNotes.includes(note)) return;

        dispatch('keyDown', { note });
        // add note to activeNotes (not using push() to force Svelte to update)
        activeNotes = [...activeNotes, note];

        console.log(activeNotes);
        console.log(activeNotes.includes(note));
    }

    function handleKeyUp(note: Tone.Unit.Frequency): void {
        dispatch('keyUp', { note });

        // remove note from activeNotes (using filter() to force Svelte to update)
        activeNotes = activeNotes.filter(note => note !== note);

        console.log(activeNotes);
    }

    /* === LIFECYCLES ========================= */
    onMount(() => {
        checkOrientation();
        isReady = true;
    });
</script>



<svelte:window on:resize={checkOrientation} />

<div class="keyboard" bind:this={keyboard}>
    {#each notesOfSegment as segment, i}
        <ol id={"segment-" + i} class="segment">
            {#each segment as note}
                <li
                    class="note"
                    class:flat={note.toString().charAt(1) === "b"}
                    class:active={activeNotes.includes(note)}>
                    <button
                        on:pointerdown={() => handleKeyDown(note)}
                        on:pointerup={() => handleKeyUp(note)}
                        on:pointerleave={() => handleKeyUp(note)}>
                        <span>{notes.indexOf(note) + 1}</span>
                    </button>
                </li>
            {/each}
        </ol>
    {/each}
</div>



<style lang="scss">
    .keyboard {
        // internal variables
        --_octave-width: 82.353%; // width of one octave as as percentage of the visible keyboard
        --_border-width: 2px;
        --_border-radius: 7px;
        --_whiteNotes: 7;

        flex-grow: 1;
        display: flex;
        flex-flow: row nowrap;
        position: relative;

        border-radius: var(--_border-radius);
        overflow: hidden;
        scroll-behavior: smooth;

        // prevent text highlighting on drag
        -webkit-user-select:none;
        user-select: none;
    }

    .segment {
        flex-shrink: 0;
        display: flex;
        flex-flow: row nowrap;

        width: calc(var(--_whiteNotes) / 7 * var(--_octave-width));
        background-color: var(--clr-250);

        &#segment-0 {          
            border-radius: var(--_border-radius) 0 0 var(--_border-radius);

            .note:first-child button {
                border-top-left-radius: var(--_border-radius);
            }
        }

        &#segment-2 {
            border-radius: 0 var(--_border-radius) var(--_border-radius) 0;

            .note:last-child button {
                border-top-right-radius: var(--_border-radius);
            }
        }
    }

    .note {
        flex-shrink: 0;
        position: relative;
        width: calc(100% / var(--_whiteNotes));

        button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            width: calc(100% + var(--_border-width));
            height: 100%;

            color: var(--clr-600);

            padding: 10px 10px 8px 10px;
            background-color: var(--clr-100);
            border: solid var(--_border-width) var(--clr-250);
            border-radius: 0 0 var(--_border-radius) var(--_border-radius);

            transition: color 0.1s ease,
                        background-color 0.1s ease;

            span {
                font-size: 1.5rem;
                font-weight: 600;
                padding-bottom: 10px;
            }
        }

        &.active button {
            color: var(--clr-700);
            background-color: var(--clr-150);
        }

        &.flat {
            margin: 0 calc(-100% / (2 * var(--_whiteNotes)));
            height: 50%;

            button {
                position: absolute;
                top: 0;
                left: 50%;
                z-index: 1;

                color: var(--clr-250);

                background-color: var(--clr-800);
                border-color: var(--clr-900);

                // transform to center notes
                transform: translate(-50%, 0);
            }

            &.active button {
                color: var(--clr-150);
                background-color: var(--clr-900);
            }
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .keyboard {
            // internal variables
            --_keyboard-height: 650px; // visible height of the keyboard
            --_octave-height: calc(0.82353 * var(--_keyboard-height)); // width of one octave as as percentage of the visible keyboard

            flex-flow: column-reverse nowrap;
            height: var(--_keyboard-height);

            border-radius: var(--_border-radius);
        }

        .segment {
            flex-flow: column-reverse nowrap;

            width: unset;
            height: calc(var(--_whiteNotes) / 7 * var(--_octave-height));

            &#segment-0 {
                border-radius: 0 0 var(--_border-radius) var(--_border-radius);
                // compensate for last border
                margin-bottom: var(--_border-width);

                .note:first-child button {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: var(--_border-radius);
                }
            }

            &#segment-2 {
                border-radius: var(--_border-radius) var(--_border-radius) 0 0;

                .note:last-child button {
                    border-top-left-radius: var(--_border-radius);
                }
            }
        }

        .note {
            width: unset;
            height: calc(var(--_whiteNotes) / 7 * var(--_octave-height) / var(--_whiteNotes));

            button {
                flex-direction: row;
                width: 100%;
                height: calc(100% + var(--_border-width));

                padding: 10px 8px 10px 10px;
                border-radius: 0 var(--_border-radius) var(--_border-radius) 0;

                span {
                    padding-right: 10px;
                    padding-bottom: 0;
                }
            }

            &.flat {
                margin: calc(-1 * (var(--_whiteNotes) / 7 * var(--_octave-height)) / (2 * var(--_whiteNotes))) 0;
                width: 50%;
                height: calc(var(--_whiteNotes) / 7 * var(--_octave-height) / var(--_whiteNotes));

                button {
                    top: unset;
                    bottom: 50%;
                    left: 0;

                    // transform to center notes
                    transform: translate(0, 50%);
                }
            }
        }
    }

    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .keyboard {
            border-radius: 0;
        }
    }
</style>