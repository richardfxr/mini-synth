<script lang="ts">
    /* === IMPORTS ============================ */
    import { page } from '$app/stores';
    import Synth from "$lib/synth.svelte";
    import type * as Tone from 'tone';

    /* === CONSTANTS ========================== */
    const slug = $page.params.slug;
    const demos: { [key: string]: Tone.Unit.Frequency[][] } = {
        "marble-machine": [
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
            ["E4"],
        ],
    };
    const melody = Object.hasOwn(demos, slug) ? demos[slug] : Array(24).fill([]);
</script>



<Synth
    {melody}/>