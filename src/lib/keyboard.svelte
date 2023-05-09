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
    export let autoSkip: boolean;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
    const borderWidth = 2;

    /* === VARIABLES ========================== */
    let keyboard: HTMLElement;
    let isReady = false;
    let isPortrait = false;
    let activeNotes: Tone.Unit.Frequency[] = [];
    let hasPlayedNote = false;

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
                targetSegment.offsetLeft + borderWidth,
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
        isReady = true;
        checkOrientation();
        newSubdiv();
    });
</script>



<svelte:window on:resize={checkOrientation} />

<div class="wrapper" style="--_border-width: {borderWidth}px">
    <div
        class="keyboard"
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
</div>





<style lang="scss">
    // internal variables
    $key-highlight-hrz: 2px;
    $key-highlight-vrt: 4px;
    $flat-width: 0.8;
    $flat-height: 55%;
    $flat-highlight-hrz: 1px;
    $flat-highlight-vrt: 6px;

    .wrapper {
        // internal variables
        --_octave-width: 82.353%; // width of one octave as as percentage of the visible keyboard
        
        --_whiteNotes: 7;
        --_label-width: 3ch;

        flex-grow: 1;
        position: relative;
        height: 100%;

        overflow: hidden;

        &::after {
            // border
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;

            border: solid var(--_border-width) var(--clr-kb-border);
            border-radius: $input-border-radius;

            pointer-events: none;
        }
    }

    .keyboard {
        display: flex;
        flex-flow: row nowrap;
        position: relative;
        height: 100%;

        background-color: var(--clr-kb-border);
        border-radius: $input-border-radius;
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
        background-color: var(--clr-kb-border);

        &#segment-0 {          
            border-radius: $input-border-radius 0 0 $input-border-radius;

            .note:first-child button {
                border-top-left-radius: $input-border-radius;

                &::before {
                    border-top-left-radius: calc($input-border-radius - $key-highlight-hrz);
                }
            }
        }

        &#segment-2 {
            border-radius: 0 $input-border-radius $input-border-radius 0;

            .note:last-child button {
                border-top-right-radius: $input-border-radius;

                &::before {
                    border-top-right-radius: calc($input-border-radius - $key-highlight-hrz);
                }
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
            position: relative;
            width: calc(100% + var(--_border-width));
            height: 100%;

            padding: 10px 10px 8px 10px;
            background-color: var(--clr-kb-white-highlight);
            border: solid var(--_border-width) var(--clr-kb-border);
            border-radius: 0 0 $input-border-radius $input-border-radius;

            transition: color 0.1s ease,
                        background-color 0.1s ease;

            &::before {
                // main color
                content: "";
                position: absolute;
                top: 0;
                right: $key-highlight-hrz;
                bottom: $key-highlight-vrt;
                left: $key-highlight-hrz;

                background-color: var(--clr-kb-white);
                border-radius:
                    0
                    0
                    calc($input-border-radius - $key-highlight-hrz)
                    calc($input-border-radius - $key-highlight-hrz);

                transition: background-color 0.1s ease;
            }

            span {
                position: relative;
                z-index: 0;
                width: var(--_label-width);

                color: var(--clr-note-text);
                font-size: 1.3rem;
                font-weight: 600;

                padding: 5px;
                margin-bottom: 12px;
                background-color: var(--_clr-note);
                border-radius: var(--borderRadius-sm);
            }
        }

        &.active button {
            background-color: var(--_clr-note-highlight);

            &::before {
                background-color: var(--_clr-note);
            }
        }

        &.flat {
            width: calc(100% / var(--_whiteNotes) * $flat-width);
            margin: 0 calc(-0.5 * (100% / var(--_whiteNotes) * $flat-width));
            height: $flat-height;

            button {
                position: absolute;
                top: 0;
                left: 50%;
                z-index: 1;

                background-color: var(--clr-kb-flat-highlight);
                box-shadow: 0 4px 7px 0 rgba(0, 0, 0, 0.2);

                // transform to center notes
                transform: translate(-50%, 0);

                &::before {
                    // main color
                    right: $flat-highlight-hrz;
                    bottom: $flat-highlight-vrt;
                    left: $flat-highlight-hrz;

                    background-color: var(--clr-kb-flat);
                }
            }

            &.active button {
                background-color: var(--_clr-note-highlight);

                &::before {
                    background-color: var(--_clr-note);
                }
            }
        }

        @for $i from 0 through 11 {
            &.note-#{$i} {
                --_clr-note: var(--clr-note-#{$i});
                --_clr-note-highlight: var(--clr-note-#{$i}-highlight);
            }
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .wrapper {
            // internal variables
            --_keyboard-height: 650px; // visible height of the keyboard
            --_octave-height: calc(0.82353 * var(--_keyboard-height)); // width of one octave as as percentage of the visible keyboard            
        }

        .keyboard {
            flex-flow: column-reverse nowrap;
            width: 100%;
            height: var(--_keyboard-height);
        }

        .segment {
            flex-flow: column-reverse nowrap;

            width: unset;
            height: calc(var(--_whiteNotes) / 7 * var(--_octave-height));

            &#segment-0 {
                border-radius: 0 0 $input-border-radius $input-border-radius;

                .note:first-child button {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: $input-border-radius;

                    &::before {
                        border-top-left-radius: 0;
                        border-bottom-left-radius: calc($input-border-radius - $key-highlight-hrz);
                    }
                }
            }

            &#segment-2 {
                border-radius: $input-border-radius $input-border-radius 0 0;

                .note:last-child button {
                    border-top-left-radius: $input-border-radius;

                    &::before {
                        border-top-left-radius: calc($input-border-radius - $key-highlight-hrz);
                    }
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
                border-radius: 0 $input-border-radius $input-border-radius 0;

                &::before {
                    // main color
                    top: $key-highlight-hrz;
                    right: $key-highlight-vrt;
                    bottom:  $key-highlight-hrz;
                    left: 0;
                    
                    border-radius:
                        0
                        calc($input-border-radius - $key-highlight-hrz)
                        calc($input-border-radius - $key-highlight-hrz)
                        0;
                }

                span {
                    margin-right: 10px;
                    margin-bottom: 0;
                }
            }

            &.flat {
                margin: calc(-1 * $flat-width * (var(--_whiteNotes) / 7 * var(--_octave-height)) / (2 * var(--_whiteNotes))) 0;
                width: $flat-height;
                height: calc($flat-width * (var(--_whiteNotes) / 7 * var(--_octave-height) / var(--_whiteNotes)));

                button {
                    top: unset;
                    bottom: 50%;
                    left: 0;

                    box-shadow: 4px 0 7px 0 rgba(0, 0, 0, 0.2);

                    // transform to center notes
                    transform: translate(0, 50%);

                    &::before {
                        // main color
                        top: $flat-highlight-hrz;
                        right: $flat-highlight-vrt;
                        bottom:  $flat-highlight-hrz;
                    }
                }
            }
        }
    }
</style>