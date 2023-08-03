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
        <div class="checkbox">
            <input
                id={song.id + "-checkbox"}
                class="visuallyHidden"
                type="checkbox"
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
            <label for={song.id + "-checkbox"}>
                <span class="visuallyHidden">select {song.title}.</span>
                <div class="box"></div>
            </label>
        </div>
        
        <a href={"/song/" + song.id} class="title">{song.title}</a>

        <div class="details">
            <div class="tapeShadow"></div>
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
    $_melody-height: calc(3 * $border-width + 3 * $_note-height + 2 * $border-width-thin);
    $_beats-height: calc(2 * $border-width + 2 * $_note-height + $border-width-thin);

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .song.active {
            background-color: var(--clr-0);

            .cassette {
                // internal variables
                --_clr-bg: var(--clr-100);
                --_clr-bg-highlight: var(--clr-highlight);
                --_clr-bg-cutout: var(--clr-200);
            }
        } 

        .tapeShadow {
            box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.15);
        }
    }

    @mixin dark {
        .song.active {
            background-color: var(--clr-100);

            .cassette {
                // internal variables
                --_clr-bg: var(--clr-200);
                --_clr-bg-highlight: var(--clr-300);
                --_clr-bg-cutout: var(--clr-100);
            }
        } 

        .tapeShadow {
            box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .song {
        position: relative;

        background-color: var(--clr-50);
        border-bottom: solid var(--border-width) var(--clr-border);

        transition: background-color var(--trans-fast) ease,
                    border-color var(--trans-fast) ease;

        &:hover, &:focus, &:active {
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

    .checkbox {
        position: relative;
        height: 100%;

        transition: background-color var(--trans-fast) ease,
                    border-color var(--trans-fast) ease;

        input {
            &:checked + label .box {
                background-color: var(--clr-red);
                border-color: var(--clr-red);

                &::before {
                    background-color: var(--clr-highlight);
                    transform: scale(0.7);
                }
            }

            &:focus-visible + label .box {
                outline-color: var(--clr-focus-red);
            }
        }

        label {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            position: relative;
            z-index: 5;
            
            cursor: pointer;

            &:hover .box::before {
                background-color: var(--clr-150);
            }

            .box {
                position: relative;
                width: $_checkbox-size;
                height: $_checkbox-size;
                border: solid var(--border-width) var(--clr-350);
                margin: 0 var(--pad-2xl);
                outline: solid $border-width-thick transparent;
                outline-offset: var(--pad-xs);

                transition: outline-color var(--trans-fast) ease;

                &::before {
                    content: "";
                    position: absolute;
                    top: var(--pad-xs);
                    right: var(--pad-xs);
                    bottom: var(--pad-xs);
                    left: var(--pad-xs);

                    background-color: var(--clr-100);

                    transition: background-color var(--trans-fast) ease,
                                transform var(--trans-normal) var(--trans-cubic-1);
                }
            }
        }
    }

    .title {
        display: block;

        color: var(--clr-900);
        font-size: 1.1rem;
        padding: var(--pad-xl) 0;
        margin-right: var(--pad-2xl);

        outline: solid $border-width-thick transparent;

        transition: color var(--trans-fast) ease,
                    outline-color var(--trans-fast) ease;

        &::before {
            // larger hitbox that covers entire song list item
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 4;
        }

        &:focus-visible {
            outline-color: var(--clr-focus-red);
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

    .tapeShadow {
        position: absolute;
        right: calc($_cassette-extrusion-inset + var(--border-width) + var(--pad-sm));
        left: 0;
        z-index: 2;

        height: calc(2 * $border-width + $_melody-height + $_beats-height);

        background-color: transparent;

        // load state
        opacity: 0;

        transition: opacity var(--trans-normal) var(--trans-cubic-1);
    }

    .tapesAndLength {
        // internal variables
        --_clr-bg: var(--clr-100);
        --_clr-border: var(--clr-500);

        flex-grow: 1;
        display: flex;
        flex-flow: row nowrap;
        position: relative;
        z-index: 3;

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

            transition: background-color var(--trans-fast) ease,
                        border-color var(--trans-fast) ease,
                        transform var(--trans-normal) var(--trans-cubic-1);

            .tape {
                display: grid;
                grid-template-columns: repeat(var(--_length), $subdiv-width);

                padding: var(--border-width);
                overflow: hidden;

                &.melody {
                    height: $_melody-height;
                    border-bottom: solid var(--border-width) var(--_clr-border);
                }

                &.beats {
                    height: $_beats-height;
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
        --_clr-border: var(--clr-cassette-border);
        --_clr-bg: var(--clr-cassette-bg);
        --_clr-bg-highlight: var(--clr-cassette-bg-highlight);
        --_clr-bg-cutout: var(--clr-cassette-cutout-bg);
        
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: $cassetts-maxWidth;
        height: $_cassette-height;

        margin: auto;

        &::before {
            // cassette housing
            content: "";
            position: absolute;
            top: 7px;
            right: 0;
            bottom: 7px;
            left: 0;

            background-color: var(--_clr-bg-highlight);
            border: solid var(--border-width) var(--_clr-border);
            border-radius: var(--borderRadius-sm);

            transition: background-color var(--trans-fast) ease,
                        border-color var(--trans-fast) ease;
        }

        &::after {
            // cassette housing background
            content: "";
            position: absolute;
            top: calc(7px + var(--border-width) + $highlight-height);
            right: var(--border-width);
            bottom: calc(7px + var(--border-width));
            left: var(--border-width);

            background-color: var(--_clr-bg);
            border-radius: calc(var(--borderRadius-sm) - var(--border-width));

            transition: background-color var(--trans-fast) ease;
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
            z-index: 1;

            background-color: var(--_clr-bg-highlight);
            padding: var(--pad-sm);
            border: solid var(--border-width) var(--_clr-border);
            border-radius: var(--borderRadius-sm);

            transition: background-color var(--trans-fast) ease,
                        border-color var(--trans-fast) ease;

            &::before {
                // ectrusion background
                content: "";
                position: absolute;
                top: $highlight-height;
                right: 0;
                bottom: 0;
                left: 0;

                background-color: var(--_clr-bg);
                border-radius: calc(var(--borderRadius-sm) - var(--border-width));

                transition: background-color var(--trans-fast) ease;
            }

            .cutout {
                flex-grow: 1;
                position: relative;
                max-width: 65px;

                background-color: var(--_clr-bg-cutout);
                border: solid var(--border-width) var(--_clr-border);

                transition: background-color var(--trans-fast) ease,
                            border-color var(--trans-fast) ease;

                &::before {
                    // cutout highlight
                    content: "";
                    position: absolute;
                    right: calc(-1 * var(--border-width));
                    bottom: calc(-1 * var(--border-width) - $highlight-height);
                    left: calc(-1 * var(--border-width));
                    height: $highlight-height;

                    background-color: var(--_clr-bg-highlight);
                    border-radius: calc(var(--borderRadius-sm) - var(--border-width));

                    transition: background-color var(--trans-fast) ease;
                }
            }
        }
    }

    .song.isReady {
        .tapeShadow {
            opacity: 1;
        }

        .tapesAndLength {
            .length, .tapes {
                // default state
                transform: translateX(0);
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