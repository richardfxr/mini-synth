<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
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



{#if $songs}
    <ul class="songs">
        {#each $songs as song}
            <li>
                <a href={"/song/" + song.id}>{song.title}</a>
            </li>
        {/each}
    </ul>
{/if}



<style lang="scss">
    .songs {
        a {
            display: block;
            padding: var(--pad-xl);
            border-bottom: solid var(--border-width) var(--clr-250);
        }
    }
</style>