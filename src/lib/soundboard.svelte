<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, createEventDispatcher } from 'svelte';

    /* === PROPS ============================== */
    export let currentSubdiv: number;
    export let beats: string[][]; // bind
    export let samples: { [key: string]: string};
    export let autoSkip: boolean;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let activeNotes: string[] = [];
    let hasPlayedNote = false;

    /* === REACTIVE DECLARATION =============== */
    // call newSubdiv() when currentSubdiv changes
    $: currentSubdiv ? newSubdiv() : newSubdiv();

    /* === FUNCTIONS ========================== */
    function newSubdiv(): void {
        // reset activeNotes and hasPlayedNote
        activeNotes = [];
        hasPlayedNote = false;
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
    // internal variables
    $button-highlight-hrz: 3px;
    $button-highlight-vrt: 10px;

    .soundboard {
        // internal variables
        --_button-height: 120px;
        --_label-width: 3ch;
        
        align-self: flex-start;
        display: grid;
        grid-template-columns: repeat( auto-fit, minmax(100px, 1fr));
        grid-template-rows: auto;
        position: relative;
        width: 100%;

        background-color: var(--clr-kb-border);
        border: solid var(--border-width) var(--clr-kb-border);
        border-radius: calc($input-border-radius + var(--border-width));

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            height: var(--_button-height);

            background-color: var(--clr-0);
            border: solid var(--border-width) var(--clr-kb-border);
            border-radius: $input-border-radius;

            transition: background-color var(--trans-fastest) ease,
                        border-color var(--trans-fastest) ease;

            &::before {
                // main color
                content: "";
                position: absolute;
                top: $button-highlight-vrt;
                right: $button-highlight-hrz;
                bottom: 0;
                left: $button-highlight-hrz;

                background-color: var(--clr-100);
                border-radius: calc($input-border-radius - $button-highlight-hrz);
                box-shadow: inset 0 0 10px 0 rgba(0, 0, 0, 0.1);

                transition: background-color var(--trans-fastest) ease,
                            transform var(--trans-fastest) ease;
            }

            // beat colors
            @each $beat, $index in $beats {
                &##{$beat} {
                    --_clr: var(--clr-note-#{$index});
                    --_clr-highlight: var(--clr-note-#{$index}-highlight);
                }
            }

            span {
                display: block;
                position: relative;
                width: var(--_label-width);

                color: var(--clr-1000);
                font-size: 1.3rem;

                padding: 5px;
                background-color: var(--_clr);
                border-radius: var(--borderRadius-sm);
            }

            &.active {
                background-color: var(--_clr-highlight);
                border-color: var(--clr-600);

                &::before {
                    background-color: var(--_clr);
                    transform: translateY(-5px);
                }
            }
        }
    }
</style>