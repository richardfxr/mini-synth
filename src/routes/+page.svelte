<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { goto } from '$app/navigation';
    // Dexie
    import { liveQuery } from "dexie";
    import { db } from "../storage/db";
    // stores
    import { firstLoad } from "../storage/store";
    // components
    import Song from '$lib/song.svelte';

    /* === VARIABLES ========================== */
    let selectedSongs: number[] = [];
    let newSongs: number[] = [];
    let working = false;

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
        const retrievedSongs = await db.songs.toArray();

        if ($firstLoad && (!retrievedSongs || retrievedSongs.length === 0)) {
            // go to new song on first load with no songs
            $firstLoad = false;
            goto('/song/new');
        } else {
            $firstLoad = false;
        }
    });
</script>



<div
    class="index"
    in:fly={{ y: -20, duration: 200, delay: 200 }}
    out:fly={{ y: -20, duration: 200 }}>
    {#if $songs}
        <ul class="songs">
            {#each $songs as song}
                <Song
                    bind:selectedSongs = {selectedSongs}
                    {newSongs}
                    {song} />
            {/each}
        </ul>
    {/if}

    <ul class="actions">
        <li id="new">
            <a
                href="/song/new"
                class="button">
                <span class="visuallyHidden">new song</span>
                <span>+</span>
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
</div>




<style lang="scss">
    :global(html) {
        scroll-behavior: smooth;
    }

    .index {
        // internal variables
        --_actions-height: calc(var(--button-minSize) + var(--pad-lg) + var(--pad-2xl));

        padding-bottom: var(--_actions-height);
    }
    .songs {
        // animation: songsLoad var(--trans-normal) var(--trans-cubic-1) 1;
        // animation-delay: 250ms;
        // animation-fill-mode: backwards;
    }

    .actions {
        display: flex;
        flex-flow: row nowrap;
        gap: var(--pad-sm);
        position: fixed;
        right: calc(50% - min(100%, $page-maxWidth) / 2);
        bottom: 0;
        z-index: 1000;
        max-width: $page-maxWidth;

        padding: var(--pad-lg) var(--pad-2xl) var(--pad-2xl) var(--pad-2xl);
        margin: 0 auto;

        #new {
            order: 1;

            .button {
                width: 90px;
            }
        }

        #duplicate, #delete {
            .button {
                opacity: 1;
                transform: translateY(0);

                transition: opacity var(--trans-normal) var(--trans-cubic-1),
                            transform var(--trans-normal) var(--trans-cubic-1);

                &.disabled {
                    opacity: 0;
                    transform: translateY(var(--_actions-height));

                    transition: opacity var(--trans-normal) cubic-bezier(.7,0,.93,.67),
                                transform var(--trans-normal) cubic-bezier(.7,0,.93,.67);
                }
            }
            
        }
    }

    /* === ANIMATIONS ========================= */
    @keyframes songsLoad {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>