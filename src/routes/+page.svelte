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
    import IndexHeader from '$lib/indexHeader.svelte';
    import SearchBar from '$lib/searchBar.svelte';
    import SongLi from '$lib/songLi.svelte';

    /* === VARIABLES ========================== */
    let songs: Song[] = [];
    let selectedSongs: number[] = [];
    let newSongs: number[] = [];
    let working = false;
    let introHasFinished = false;
    let songsAreLoaded = false;

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



<svelte:head>
    <title>Mini Synth</title>
    <meta
        name="description"
        content="A simple web-based synthesizer for anyone to create songs."
    />
</svelte:head>

<div
    class="index"
    in:fade={{ duration: 50, delay: 200 }}
    out:fade={{ duration: 200 }}>

    <IndexHeader
        isReady = {introHasFinished}
        {working}
        noSelectedSongs = {selectedSongs.length === 0}
        on:duplicate = {duplicateSelectedSongs}
        on:delete = {deleteSelectedSongs} />
    
    <SearchBar
        bind:searchQuery = {searchQuery}
        {isReady} />
    

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
        padding-bottom: var(--_actions-height);
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