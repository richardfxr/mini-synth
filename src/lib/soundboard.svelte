<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, createEventDispatcher } from 'svelte';
    // icons
    import HighHatIcon from '$lib/SVGs/highHatIcon.svelte';
    import KickDrumIcon from '$lib/SVGs/kickDrumIcon.svelte';
    import SnareDrumIcon from '$lib/SVGs/snareDrumIcon.svelte';
    import TomDrum1Icon from '$lib/SVGs/tomDrum1Icon.svelte';
    import TomDrum2Icon from '$lib/SVGs/tomDrum2Icon.svelte';
    import TomDrum3Icon from '$lib/SVGs/tomDrum3Icon.svelte';

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
            <div class="beat">
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
            </div>
        </button>
    {/each}
</div>



<style lang="scss">
    // === USE ====================================
    @use "sass:map";
    @use '../styles/colors' as *;

    // internal variables
    $beat-highlight-hrz: 2px;
    $beat-highlight-vrt: 4px;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .soundboard {
            // internal variables
            --_clr-blank: var(--clr-150);
            --_clr-blank-highlight: var(--clr-0);
        }
    }

    @mixin dark {
        .soundboard {
            // internal variables
            --_clr-blank: var(--clr-100);
            --_clr-blank-highlight: var(--clr-150);
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .soundboard {
        // internal variables
        --_button-height: 120px;
        
        align-self: flex-start;
        display: grid;
        grid-template-columns: repeat( auto-fit, minmax(100px, 1fr));
        grid-template-rows: auto;
        position: relative;
        width: 100%;

        border: solid var(--border-width-thick) transparent;
        border-radius: calc($input-border-radius + var(--border-width));

        button {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            height: var(--_button-height);

            background-color: var(--_clr-blank-highlight);
            border: solid var(--border-width) var(--clr-kb-border);
            border-radius: $input-border-radius;

            transition: background-color var(--trans-fastest) ease,
                        border-color var(--trans-fastest) ease;

            &::before {
                // main color
                content: "";
                position: absolute;
                top: $beat-highlight-vrt;
                right: $beat-highlight-hrz;
                bottom: 0;
                left: $beat-highlight-hrz;

                background-color: var(--_clr-blank);
                border-radius: calc($input-border-radius - $beat-highlight-hrz);

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

            .beat {
                display: block;
                position: relative;

                color: var(--clr-note-text);

                padding: var(--pad-lg) var(--pad-xl);
                background-color: var(--_clr);
                border-radius: var(--borderRadius-sm);

                :global(.beat.icon) {
                    width: 24px;
                    height: 24px;
                }
            }

            &.active {
                background-color: var(--_clr-highlight);

                &::before {
                    background-color: var(--_clr);
                    transform: translateY(-0.5 * $beat-highlight-vrt);
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