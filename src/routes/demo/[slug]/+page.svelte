<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    // Dexie
    import { db } from "../../../storage/db";
    // types
    import type { Song } from '../../../storage/db';

    /* === CONSTANTS ========================== */
    const slug = $page.params.slug;
    const demos: { [key: string]: Song } = {
        "marble-machine": {
            title: "Marble Machine - Wintergatan",
            melody: [
                ["E3", "E5"],
                [],
                ["G3", "B3"],
                ["B4"],
                [],
                [],
                ["G3", "B3"],
                ["A4"],
                ["E3", "G4"],
                ["A4"],
                ["G3", "B3"],
                ["B4"],
                [],
                ["G4"],
                ["G3", "B3", "A4"],
                ["D5"],

                ["G3"],
                [],
                ["B3", "D4"],
                ["B4"],
                [],
                [],
                ["B3", "D4"],
                ["A4"],
                ["G3", "G4"],
                ["A4"],
                ["B3", "D4"],
                ["Gb4"],
                [],
                ["G4"],
                ["B3", "D4", "A4"],
                ["D5"],

                ["Gb3"],
                [],
                ["B3", "D4"],
                ["B4"],
                [],
                [],
                ["B3", "D4"],
                ["D5"],
                ["Gb3", "C5"],
                ["B4"],
                ["B3", "D4"],
                ["A4"],
                [],
                ["G4"],
                ["B3", "D4", "A4"],
                ["E4"]
            ],
            beats: [
                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],
                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],
                
                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],
                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],

                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],
                ["kc"],
                [],
                ["sn", "kc"],
                [],
                ["kc"],
                [],
                ["sn", "kc"],
                ["kc"],
            ],
            bpm: 80,
        },
    };

    let song: Song | null = null;

    if (Object.hasOwn(demos, slug)) 
        song = demos[slug];

    /* === LIFECYCLES ========================= */
    onMount(async () => {
        if (song) {
            // create new song in database
            try {
                const id = await db.songs.add({
                    title: song.title,
                    melody: song.melody,
                    beats: song.beats,
                    bpm: song.bpm,
                });

                goto('/song/' + id, { replaceState: true });
            } catch (error) {
                console.log("new song error: " + error);
            }
        } else {
            goto('/', { replaceState: true });
        }
    });
</script>