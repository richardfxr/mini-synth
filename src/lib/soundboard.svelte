<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, createEventDispatcher } from 'svelte';
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let currentSubdiv: number;
    export let beats: string[][]; // bind
    export let samples: { [key: string]: string};

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let activeNotes: string[] = [];
    let hasPlayedNote = false;
    let autoSkip = false;

    /* === REACTIVE DECLARATION =============== */
    // call newSubdiv() when currentSubdiv changes
    $: currentSubdiv ? newSubdiv() : newSubdiv();

    /* === FUNCTIONS ========================== */
    function newSubdiv(): void {
        // reset activeNotes and hasPlayedNote
        activeNotes = [];
        hasPlayedNote = false;

        if (
            beats[currentSubdiv].length === 0 &&
            currentSubdiv + 1 < beats.length &&
            beats[currentSubdiv + 1 ].length === 0) {
            // enable autoSkip if currentSubdiv started empty and next subdiv is also empty
            autoSkip = true;
            console.log("autoSkip: true");
        } else {
            autoSkip = false;
            console.log("autoSkip: false");
        }
    }

    function handleButtonDown(beat: string): void {
        if (beats[currentSubdiv].includes(beat)) {
            // remove from activeNotes
            handleButtonUp(beat);
            // remove sample from beats (using filter() to force Svelte to update)
            beats[currentSubdiv] = beats[currentSubdiv].filter(e => e !== beat);
        } else {
            dispatch('play', { beat });
            activeNotes.push(beat);
            hasPlayedNote = true;
            // add sample to beats (not using push() to force Svelte to update)
            beats[currentSubdiv] = [...beats[currentSubdiv], beat];
        }
    }

    function handleButtonUp(beat: string): void {
        const index = activeNotes.indexOf(beat);
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
        newSubdiv();
    });
</script>


<div class="soundboard">
    {#each Object.entries(samples) as [beat, _]}
        <button
            id={beat}
            class:active={beats[currentSubdiv].includes(beat)}
            on:pointerdown={() => handleButtonDown(beat)}
            on:pointerup={() => handleButtonUp(beat)}
            on:pointerleave={() => handleButtonUp(beat)}>
            <span>{beat}</span>
        </button>
    {/each}
</div>



<style lang="scss">
    .soundboard {
        // internal variables
        --_button-height: 120px;
        --_label-width: 3ch;
        
        align-self: flex-start;
        display: grid;
        grid-template-columns: repeat( auto-fit, minmax(100px, 1fr));
        grid-template-rows: auto;
        gap: 4px;
        width: 100%;

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--_button-height);

            background-color:  var(--clr-100);
            border: solid var(--border-width) var(--clr-250);
            border-radius: var(--borderRadius-sm);

            transition: background-color var(--trans-fastest) ease,
                        border-color var(--trans-fastest) ease;

            // beat colors
            @each $beat, $index in $beats {
                &##{$beat} {
                    --_clr: var(--clr-note-#{$index});
                }
            }

            span {
                display: block;
                width: var(--_label-width);

                color: var(--clr-1000);
                font-size: 1.3rem;

                padding: 5px;
                background-color: var(--_clr);
            }

            &.active {
                background-color: var(--_clr);
                border-color: var(--clr-600);
            }
        }
    }
</style>