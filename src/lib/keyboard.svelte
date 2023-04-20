<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, createEventDispatcher } from 'svelte';
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let currentSubdiv: number;
    export let currentKbSegment: 0 | 1 | 2;
    export let melody: Tone.Unit.Frequency[][]; // bind
    export let notes: Tone.Unit.Frequency[];
    export let notesOfSegment: Tone.Unit.Frequency[][];

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
    const borderWidth = 2;

    /* === VARIABLES ========================== */
    let keyboard: HTMLElement;
    let isReady = false;
    let isPortrait = false;
    let activeNotes: Tone.Unit.Frequency[] = [];
    let hasPlayedNote = false;
    let autoSkip = false;

    /* === REACTIVE DECLARATION =============== */
    // call newSubdiv() when currentSubdiv changes
    $: currentSubdiv ? newSubdiv() : newSubdiv();
    // call scrollToCurrentSegment() when currentKbSegment changes
    $: currentKbSegment ? scrollToCurrentSegment() : scrollToCurrentSegment();

    /* === FUNCTIONS ========================== */
    function checkOrientation(): void {
        isPortrait = window.matchMedia("(orientation: portrait)").matches;
        scrollToCurrentSegment();
    }

    function newSubdiv(): void {
        // release all notes and reset activeNotes
        activeNotes.forEach(note => handleKeyUp(note));
        activeNotes = [];
        hasPlayedNote = false;
        console.log("new subdiv: " + currentSubdiv);

        if (
            melody[currentSubdiv].length === 0 &&
            currentSubdiv + 1 < melody.length &&
            melody[currentSubdiv + 1 ].length === 0) {
            // enable autoSkip if currentSubdiv started empty and next subdiv is also empty
            autoSkip = true;
            console.log("autoSkip: true");
        } else {
            autoSkip = false;
            console.log("autoSkip: false");
        }
    }

    function scrollToCurrentSegment(): void {
        if (!isReady) return;

        const targetSegment = keyboard.children[currentKbSegment] as HTMLElement;

        if (isPortrait) {
            keyboard.scrollTop = Math.min(
                targetSegment.offsetTop + targetSegment.offsetHeight - keyboard.offsetHeight + borderWidth,
                targetSegment.offsetHeight * 3 - keyboard.offsetHeight + borderWidth
            );
        } else {
            keyboard.scrollLeft = Math.min(
                targetSegment.offsetLeft,
                targetSegment.offsetWidth * 3 - keyboard.offsetWidth
            );
        }
    }

    function handleKeyDown(note: Tone.Unit.Frequency): void {
        if (melody[currentSubdiv].includes(note)) {
            // stop playing note
            handleKeyUp(note);
            // remove note from melody (using filter() to force Svelte to update)
            melody[currentSubdiv] = melody[currentSubdiv].filter(e => e !== note);
        } else {
            dispatch('keyDown', { note });
            activeNotes.push(note);
            hasPlayedNote = true;
            // add note to melody (not using push() to force Svelte to update)
            melody[currentSubdiv] = [...melody[currentSubdiv], note];
        }
    }

    function handleKeyUp(note: Tone.Unit.Frequency): void {
        dispatch('keyUp', { note });
        const index = activeNotes.indexOf(note);
        if (index > -1) {
            activeNotes.splice(index, 1);
        }

        if (activeNotes.length === 0 && autoSkip && hasPlayedNote) {
            // skip to next subdiv if autoSkip and all notes have been released
            dispatch('nextSubDiv');
        }
    }

    /* === LIFECYCLES ========================= */
    onMount(() => {
        checkOrientation();
        newSubdiv();
        isReady = true;
    });
</script>



<svelte:window on:resize={checkOrientation} />

<div
    class="keyboard"
    style="--_border-width: {borderWidth}px"
    bind:this={keyboard}>
    {#each notesOfSegment as segment, i}
        <ol id={"segment-" + i} class="segment">
            {#each segment as note, j}
                <li
                    class="note note-{j % 12}"
                    class:flat={note.toString().charAt(1) === "b"}
                    class:active={melody[currentSubdiv].includes(note)}>
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
        --_border-radius: 7px;
        --_whiteNotes: 7;
        --_label-width: 3ch;

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
                width: var(--_label-width);

                color: var(--clr-1000);
                font-size: 1.3rem;
                font-weight: 600;

                padding: 5px;
                margin-bottom: 12px;
                background-color: var(--_clr-note);
                border-radius: var(--borderRadius-sm);
            }
        }

        &.active button {
            background-color: var(--_clr-note);
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
                background-color: var(--_clr-note);
            }
        }

        @for $i from 0 through 11 {
            &.note-#{$i} {
                --_clr-note: var(--clr-note-#{$i});
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
                    margin-right: 10px;
                    margin-bottom: 0;
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