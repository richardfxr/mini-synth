<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    // Dexie
    import { liveQuery } from "dexie";
    import { db } from "../storage/db";
    // stores
    import { firstLoad } from "../storage/store";
    // components
    import Song from '$lib/song.svelte';
    // icons
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';

    /* === VARIABLES ========================== */
    let selectedSongs: number[] = [];
    let newSongs: number[] = [];
    let working = false;
    let introHasFinished = false;
    let songsAreLoaded = false;

    /* === REACTIVE DECLARATIONS ============== */
    $: isReady = songsAreLoaded && introHasFinished;
    $: songs = liveQuery(async () => {
        //
        // Query Dexie's API
        //
        const songs = await db.songs.toArray();

        // Return result
        return songs;
    });

    /* === FUNCTIONS ========================== */
    async function duplicateSelectedSongs() {
        if (working) return;

        working = true;
        newSongs = [];
        try {
            selectedSongs.forEach(async (id) => {
                // get song from database
                const song = await db.songs.get(id);

                if (song) {
                    const newId = await db.songs.add({
                        title: song.title + "*",
                        melody: song.melody,
                        beats: song.beats,
                        bpm: song.bpm
                    });

                    newSongs = [...newSongs, newId];
                } else {
                    console.log("could not find song " + id);
                }
            });
        } catch (error) {
            console.log(error);
        }
        selectedSongs = [];
        working = false;
    }

    async function deleteSelectedSongs() {
        if (working) return;

        working = true;
        try {
            selectedSongs.forEach(async (id) => {
                await db.songs.delete(id);
            });
        } catch (error) {
            console.log(error);
        }
        selectedSongs = [];
        working = false;
    }

    /* === LIFECYCLES ========================= */
    onMount(async () => {
        // time intro 
        if ($firstLoad) {
            introHasFinished = true;
        } else {
            setTimeout(() => {
                introHasFinished = true;
            }, 225);
        }

        const retrievedSongs = await db.songs.toArray();
        songsAreLoaded = true;

        if ($firstLoad && (!retrievedSongs || retrievedSongs.length === 0)) {
            // go to new song on first load with no songs
            $firstLoad = false;
            goto('/song/new');
        } else {
            $firstLoad = false;
        }
    });

    beforeNavigate(() => {
        // unready on naviagation
        introHasFinished = false;
    });
</script>



<div
    class="index"
    in:fade={{ duration: 50, delay: 200 }}
    out:fade={{ duration: 200 }}>

    <ul class="actions" class:isReady={introHasFinished}>
        <li id="new">
            <a
                href="/song/new"
                class="button">
                <span class="visuallyHidden">new song</span>
                <PlusIcon />
            </a>
        </li>
        <li id="duplicate">
            <button
                class="button"
                class:disabled={selectedSongs.length === 0}
                disabled={selectedSongs.length === 0 || working}
                on:click={duplicateSelectedSongs}>
                <span class="visuallyHidden">duplicate selected songs</span>
                <span>C</span>
            </button>
        </li>
        <li id="delete">
            <button
                class="button"
                class:disabled={selectedSongs.length === 0}
                disabled={selectedSongs.length === 0 || working}
                on:click={deleteSelectedSongs}>
                <span class="visuallyHidden">delete selected songs</span>
                <span>D</span>
            </button>
        </li>
    </ul>

    {#if $songs}
        <ul
            class="songs"
            class:isReady>
            {#each $songs as song}
                <Song
                    bind:selectedSongs = {selectedSongs}
                    {newSongs}
                    {song}
                    {isReady} />
            {/each}
        </ul>
    {/if}
</div>




<style lang="scss">
    :global(html) {
        scroll-behavior: smooth;
    }

    .index {
        // internal variables
        --_actions-height: calc(var(--button-minSize) + 2 * var(--pad-2xl));

        padding-bottom: var(--_actions-height);
    }

    .actions {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        gap: var(--pad-sm);
        position: sticky;
        top: 0;
        right: 0;
        z-index: 1000;
        max-width: $page-maxWidth;

        padding: var(--pad-2xl);
        margin: 0 auto;

        // allow click through
        pointer-events: none;

        // load state
        transform: translateY(calc(-0.5 * var(--_actions-height)));
        opacity: 0;

        transition: transform var(--trans-normal) ease-in-out,
                    opacity var(--trans-normal) ease-in-out;

        &.isReady {
            transform: translateY(0);
            opacity: 1;
        }

        #new {
            order: 1;

            .button {
                width: 90px;
                pointer-events: auto; 
            }
        }

        #duplicate, #delete {
            .button {
                opacity: 1;
                transform: translateY(0);

                transition: opacity var(--trans-normal) var(--trans-cubic-1),
                            transform var(--trans-normal) var(--trans-cubic-1);

                pointer-events: auto;

                &.disabled {
                    opacity: 0;
                    transform: translateY(calc(-1 * var(--_actions-height)));

                    transition: opacity var(--trans-normal) cubic-bezier(.7,0,.93,.67),
                                transform var(--trans-normal) cubic-bezier(.7,0,.93,.67);
                }
            }
            
        }
    }

    .songs {
        border-top: solid var(--border-width) var(--clr-150);

        // load state
        transform: translateY(70px);
        opacity: 0;

        transition: transform var(--trans-normal) var(--trans-cubic-1),
                    opacity var(--trans-normal) var(--trans-cubic-1);

        &.isReady {
            // default state
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>