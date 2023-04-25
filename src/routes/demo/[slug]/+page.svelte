<script lang="ts">
    /* === IMPORTS ============================ */
    import { page } from '$app/stores';
    import Synth from "$lib/synth.svelte";
    import type * as Tone from 'tone';

    /* === TYPES ============================== */
    type Song = {
        title: string
        melody: Tone.Unit.Frequency[][],
        beats: string[][] 
    };

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
        },
    };

    let song: Song | null = null;

    if (Object.hasOwn(demos, slug)) 
        song = demos[slug];
</script>



<Synth
    title = {song?.title ? song.title : "demo"}
    melody = {song?.melody ? song.melody : Array(24).fill([])}
    beats = {song?.beats ? song.beats : Array(24).fill([])}/>