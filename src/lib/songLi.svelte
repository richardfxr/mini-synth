<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    // types
    import type { Song } from '../storage/db';
    // data
    import { notes } from '$lib/synth.svelte';

    /* === PROPS ============================== */
    export let selectedSongs: number[];
    export let newSongs: number[];
    export let song: Song;
    export let isReady: boolean;

    /* === VARIABLES ========================== */
    let songListItem: HTMLLIElement;

    /* === REACTIVE DECLARATIONS ============== */
    $: newSongs && checkScroll();

    /* === FUNCTIONS ========================== */
    function checkScroll() {
        if (!song || !songListItem || !newSongs) return;

        if (newSongs[0] && newSongs[0] == song.id) {
            songListItem.scrollIntoView(true);
        }
    }

    /* === LIFECYCLES ========================= */
    onMount(() => {
        checkScroll();
    });
</script>



<li
    class="song"
    class:active={song.id !== undefined ? selectedSongs.includes(song.id) : false}
    class:new={song.id !== undefined ? newSongs.includes(song.id) : false}
    class:isReady
    transition:fade|local={{ duration: 150 }}
    bind:this={songListItem}>
    <div>
        <label>
            <input
                class="visuallyHidden"
                type=checkbox
                name="songs"
                value={song.id}
                checked={song.id !== undefined ? selectedSongs.includes(song.id) : false}
                on:input={() => {
                    if (song.id !== undefined && selectedSongs.includes(song.id)) {
                        // remove song from selectedSongs if it already exists
                        selectedSongs = selectedSongs.filter(e => e !== song.id);
                    } else if (song.id !== undefined) {
                        // add the song to selectedSongs otherwise
                        selectedSongs = [...selectedSongs, song.id];
                    }
                }}>
            <span class="visuallyHidden">{song.title}</span>
            <div class="checkbox"></div>
        </label>
        <a href={"/song/" + song.id} class="title">{song.title}</a>
        <div class="details">
            <div class="tapesAndLength">
                <p class="length">
                    <span>{Math.floor((song.melody.length) / 16)}:{Math.floor((song.melody.length) / 4) % 4}:{(song.melody.length) % 4}</span>
                </p>
                <div class="tapes">
                    <!-- melody tape -->
                    <ol
                        class="tape melody"
                        style="--_length: {song.melody.length}">
                        {#each song.melody as subdiv}
                            <li class="subdiv">
                                {#each subdiv as note}
                                    <p class="note-{notes.indexOf(note) % 12}">
                                        <span class="visuallyHidden">{notes.indexOf(note) + 1}</span>
                                    </p>
                                {/each}
                            </li>
                        {/each}
                    </ol>
                    <!-- beats tape -->
                    <ol
                        class="tape beats"
                        style="--_length: {song.beats.length}">
                        {#each song.beats as subdiv}
                            <li class="subdiv">
                                {#each subdiv as beat}
                                    <p class="beat-{beat}">
                                        <span class="visuallyHidden">{beat}</span>
                                    </p>
                                {/each}
                            </li>
                        {/each}
                    </ol>
                </div>
            </div>
            <div class="cassette">
                <div class="extrusion">
                    <div id="left" class="cutout"></div>
                    <div id="center" class="cutout"></div>
                    <div id="right" class="cutout"></div>
                </div>
            </div>
        </div>
    </div>
</li>



<style lang="scss">
    // internal variables
    $_checkbox-size: 18px;
    $_label-width: calc($_checkbox-size + 2 * var(--pad-2xl));
    $_cassette-height: 50px;
    $_cassette-extrusion-inset: 30px;
    $_note-height: 3px;

    .song {
        position: relative;

        background-color: var(--clr-100);
        border-bottom: solid var(--border-width) var(--clr-border);

        transition: background-color var(--trans-fast) ease;

        &:hover, &:active {
            .title {
                color: var(--clr-1000);
            }

            .tapesAndLength {
                --_clr-bg: var(--clr-highlight-dim);
                --_clr-border: var(--clr-900);

                .length {
                    background-color: var(--clr-900);
                }
            }
        }

        &:active .tapesAndLength, &.active .tapesAndLength {
            --_clr-bg: var(--clr-highlight);
        }

        &.active {
            background-color: var(--clr-highlight);

            .cassette {
                --_clr-bg: var(--clr-highlight);
            }
        }

        &.new {
            background-color: var(--clr-highlight-dim);

            .cassette {
                --_clr-bg: var(--clr-highlight-dim);
            }
        }

        & > div {
            display: grid;
            grid-template-columns: $_label-width 35ch 1fr;
            align-items: center;
            max-width: $page-maxWidth;
            margin: 0 auto;
        }
    }

    label {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 3;
        width: 100%;
        height: 100%;

        padding: 0 var(--pad-2xl);

        cursor: pointer;
    }

    .checkbox {
        position: relative;
        width: $_checkbox-size;
        height: $_checkbox-size;

        border: solid var(--border-width) var(--clr-350);

        transition: background-color var(--trans-fast) ease,
                    border-color var(--trans-fast) ease;

        &::before {
            content: "";
            position: absolute;
            top: var(--pad-xs);
            right: var(--pad-xs);
            bottom: var(--pad-xs);
            left: var(--pad-xs);

            background-color: var(--clr-150);

            transition: background-color var(--trans-fast) ease,
                        transform var(--trans-normal) var(--trans-cubic-1);
        }
    }

    input:checked ~ .checkbox {
        background-color: var(--clr-red);
        border-color: var(--clr-red);

        &::before {
            background-color: var(--clr-highlight);
            transform: scale(0.7);
        }
    }

    .title {
        display: block;

        color: var(--clr-900);
        font-size: 1.1rem;
        padding: var(--pad-xl) var(--pad-xl) var(--pad-xl) 0;

        transition: color var(--trans-fast) ease;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 2;
        }
    }

    .details {
        min-width: 0;

        display: flex;
        align-items: center;
        position: relative;
        height: $_cassette-height;

        margin-top: var(--pad-xl);
        margin-right: var(--pad-2xl);
        margin-bottom: var(--pad-xl);
    }

    .tapesAndLength {
        // internal variables
        --_clr-bg: var(--clr-100);
        --_clr-border: var(--clr-500);

        flex-grow: 1;
        display: flex;
        flex-flow: row nowrap;
        position: relative;
        z-index: 1;

        border-right: solid var(--border-width) var(--_clr-border);
        margin-right: calc($_cassette-extrusion-inset + var(--border-width) + var(--pad-sm));
        overflow: hidden;

        transition: background-color var(--trans-fast) ease,
                    border-color var(--trans-fast) ease;

        .length {
            display: flex;
            align-items: center;

            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
            color: var(--clr-highlight);
            background-color: var(--clr-800);
            padding: var(--pad-xs) var(--pad-xl);

            // load state
            transform: translateX(70px);

            transition: background-color var(--trans-fast) ease,
                        transform var(--trans-normal) var(--trans-cubic-1);

            span {
                font-family: inherit;
            }
        }

        .tapes {
            min-width: 100%;

            background-color: var(--_clr-bg);
            border-top: solid var(--border-width) var(--_clr-border);
            border-bottom: solid var(--border-width) var(--_clr-border);

            // load state
            transform: translateX(70px);

            transition: border-color var(--trans-fast) ease,
                        transform var(--trans-normal) var(--trans-cubic-1);

            .tape {
                display: grid;
                grid-template-columns: repeat(var(--_length), $subdiv-width);

                padding: var(--border-width);
                overflow: hidden;

                &.melody {
                    height: calc(3 * var(--border-width) + 3 * $_note-height + 2 * var(--border-width-thin));
                    border-bottom: solid var(--border-width) var(--_clr-border);
                }

                &.beats {
                    height: calc(2 * var(--border-width) + 2 * $_note-height + var(--border-width-thin));
                }

                .subdiv {
                    display: flex;
                    flex-flow: column nowrap;
                    gap: var(--border-width-thin);

                    border-right: solid calc(0.5 * var(--border-width)) var(--_clr-bg);
                    border-left: solid calc(0.5 * var(--border-width)) var(--_clr-bg);

                    transition: border-color var(--trans-fast) ease;

                    p {
                        height: $_note-height;

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
        }
    }

    .cassette {
        // internal variables
        --_clr-bg: var(--clr-100);
        --_clr-border: var(--clr-250);

        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: $cassetts-maxWidth;
        height: $_cassette-height;

        margin: auto;

        &::before {
            content: "";
            position: absolute;
            top: 7px;
            right: 0;
            bottom: 7px;
            left: 0;

            background-color: var(--_clr-bg);
            border: solid var(--border-width) var(--_clr-border);
            border-radius: var(--borderRadius-sm);
        }

        .extrusion {
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;

            position: absolute;
            top: 0;
            right: $_cassette-extrusion-inset;
            bottom: 0;
            left: $_cassette-extrusion-inset;

            background-color: var(--_clr-bg);
            padding: var(--pad-sm);
            border: solid var(--border-width) var(--_clr-border);
            border-radius: var(--borderRadius-sm);

            transition: background-color var(--trans-fast) ease;

            .cutout {
                flex-grow: 1;
                max-width: 65px;

                background-color: var(--clr-100);
                border: solid var(--border-width) var(--_clr-border);
            }
        }
    }

    .song.isReady {
        .tapesAndLength {
            .length, .tapes {
                // default state
                transform: translateX(0);
            }
        }
    }

    /* === COLOR SCHEME ======================= */
    @media (prefers-color-scheme: dark) {
        .cassette {
            // internal variables
            --_clr-bg: var(--clr-150);
            --_clr-border: var(--clr-0);
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (max-width: 770px) {
        .song > div {
            grid-template-columns: $_label-width 30ch 1fr;
        }
    }

    @media (max-width: 680px) {
        .song > div {
            grid-template-columns: $_label-width 1fr;
            grid-template-rows: auto;
            grid-template-areas:
                "label title"
                "details details";
        }

        .title {
            padding-top: var(--pad-3xl);
            padding-bottom: var(--pad-3xl);
        }

        .details {
            grid-area: details;
            margin-top: 0;
            margin-bottom: var(--pad-2xl);
            margin-left: var(--pad-2xl);
        }
    }

    /* === ANIMATIONS ========================= */
    @keyframes tapeLoad {
        from {
            transform: translateX(100px);
        }
        to {
            transform: translateX(0);
        }
    }
</style>