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

    $: songs = liveQuery(async () => {
        //
        // Query Dexie's API
        //
        const songs = await db.songs.toArray();

        // Return result
        return songs;
    });

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
                <li>
                    <a href={"/song/" + song.id}>{song.title}</a>
                </li>
            {/each}
        </ul>
    {/if}

    <a
        href="/song/new"
        class="button new">
        <span>new</span>
    </a>
</div>




<style lang="scss">
    .songs {
        // animation: songsLoad var(--trans-normal) var(--trans-cubic-1) 1;
        // animation-delay: 250ms;
        // animation-fill-mode: backwards;

        a {
            display: block;
            padding: var(--pad-xl);
            border-bottom: solid var(--border-width) var(--clr-250);
        }
    }

    .new.button {
        width: 8ch;
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