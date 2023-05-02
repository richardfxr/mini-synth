<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { fade } from 'svelte/transition';
    // Dexie
    import { db } from "../storage/db";
    // stores
    import { firstLoad } from "../storage/store";
    // types
    import type { Song } from "../storage/db";
    // components
    import SongLi from '$lib/songLi.svelte';
    // icons
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';
    import TrashCanIcon from '$lib/SVGs/trashCanIcon.svelte';
    import DuplicateIcon from '$lib/SVGs/duplicateIcon.svelte';

    /* === VARIABLES ========================== */
    let songs: Song[] = [];
    let selectedSongs: number[] = [];
    let newSongs: number[] = [];
    let working = false;
    let introHasFinished = false;
    let songsAreLoaded = false;

    let searchInput: HTMLInputElement;
    let searchQuery = "";

    /* === REACTIVE DECLARATIONS ============== */
    $: isReady = songsAreLoaded && introHasFinished;
    $: filteredSongs = 
        songs && searchQuery === "" ?
            songs :
            songs ?
                songs.filter(song => song.title.toLowerCase().includes(searchQuery.toLowerCase())) :
                null;

    /* === FUNCTIONS ========================== */
    async function getSongs(): Promise<void> {
        try {
            songs = await db.songs.toArray();
            console.log("songs: ", songs);
        } catch (error) {
            console.log(error);
        }
    }

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

                await getSongs();
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

            await getSongs();
        } catch (error) {
            console.log(error);
        }

        selectedSongs = [];
        working = false;
    }

    /* === LIFECYCLES ========================= */
    onMount(async () => {
        console.log("index onMount");
        // time intro 
        if ($firstLoad) {
            introHasFinished = true;
        } else {
            setTimeout(() => {
                introHasFinished = true;
            }, 225);
        }

        await getSongs();

        if ($firstLoad && (!songs || songs.length === 0)) {
            // go to new song on first load with no songs
            $firstLoad = false;
            goto('/song/new');
        } else {
            $firstLoad = false;
        }

        songsAreLoaded = true;
        console.log("onMount finished");
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
                <DuplicateIcon />
            </button>
        </li>
        <li id="delete">
            <button
                class="button warn"
                class:disabled={selectedSongs.length === 0}
                disabled={selectedSongs.length === 0 || working}
                on:click={deleteSelectedSongs}>
                <span class="visuallyHidden">delete selected songs</span>
                <TrashCanIcon />
            </button>
        </li>
    </ul>

    <div class="search">
        <form on:submit|preventDefault={() => searchInput.blur()}>
            <label for="search__input">
                <span class="visuallyHidden">search songs</span>
            </label>

            <input
                id="search__input"
                type="search"
                autocomplete="off"
                placeholder=""
                disabled={!isReady}
                bind:this={searchInput}
                bind:value={searchQuery}>

            <button
                class="button"
                type="reset"
                on:click|preventDefault={() => searchQuery = ""}>
                <span class="visuallyHidden">reset search</span>
            </button>
        </form>
    </div>
    
    

    {#if songs.length > 0 && filteredSongs}
        <ul
            class="songs"
            class:isReady>
            {#each filteredSongs as song}
                <SongLi
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

    .search {
        background-color: var(--clr-100);
        border-top: solid var(--border-width) var(--clr-150);
        border-bottom: solid var(--border-width) var(--clr-150);

        transition: background-color var(--trans-fast) ease;

        form {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            max-width: $page-maxWidth;

            padding: 0 var(--pad-2xl);
            margin: 0 auto;
        }

        input {
            width: 100%;
            color: var(--clr-900);
            font-size: 1.3rem;
            font-weight: 500;
            line-height: 1em;

            padding: var(--pad-2xl) 0;

            transition: color var(--trans-fast) ease;

            &::placeholder {
                color: var(--clr-700);

                transition: color var(--trans-fast) ease;
            }

            &::-webkit-search-cancel-button {
                -webkit-appearance: none;
            }
        }
    }

    .songs {
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