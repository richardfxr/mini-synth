<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import * as Tone from 'tone';
    import type { BPM } from 'tone/build/esm/core/type/Units';

    /* === VARIABLES ========================== */
    let synth: Tone.PolySynth;
    let bpm: BPM = 80;
    let melody: Tone.Unit.Frequency[][] = [];
    let melodyPart: Tone.Part;
    let notesToPlay: [Tone.Unit.Time, Tone.Unit.Frequency[]][] = [];

    let trackContainer: HTMLElement;
    let trackFrame: number;

    function scrollTrack(): void {
        if (!browser || !trackContainer || Tone.Transport.state !== "started") return;

        const trackLength = melody.length * 50;
        trackContainer.scrollLeft = Tone.Transport.progress * trackLength;

        console.log("progress: " + Tone.Transport.progress);
        console.log("trackLength: " + trackLength);
        console.log("srollLeft: " + Tone.Transport.progress * trackLength);

        trackFrame = requestAnimationFrame(scrollTrack);
    };

    /* === LIFECYCLES ========================= */
    onMount(() => {
        // initialize synth
        synth = new Tone.PolySynth(Tone.Synth, {
			oscillator: {
				partials: [0, 2, 3, 4],
			}
		}).toDestination();

        // set transporter properties
        Tone.Transport.bpm.value = bpm;

        melody = [
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
        ];

        melody.forEach((subdiv, index) =>{
            const time = "0:0:" + index;
            notesToPlay[index] = [time, subdiv];
        })

        melodyPart = new Tone.Part(((time, note) => {
            console.log(JSON.stringify(note) + " @ " + Tone.Time(time).toBarsBeatsSixteenths());
            synth.triggerAttackRelease(note, "16n", time);
        }), notesToPlay).start(0);

        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = "0:0:" + notesToPlay.length;

        return () => {
            cancelAnimationFrame(trackFrame);
        };
    });
</script>



<div
    class="trackContainer"
    bind:this={trackContainer}>
    <div class="trackPadding"></div>
    <div
        class="tracks"
        style="--melodyLength: {melody.length}">
        {#each melody as subdiv}
            <div class="subdiv">
                {#each subdiv as note}
                    <p>{note}</p>
                {/each}
            </div>
        {/each}
    </div>
    <div class="trackPadding"></div>
</div>

<button on:click={async () => {
    await Tone.start();
    Tone.Transport.start();
    trackFrame = requestAnimationFrame(scrollTrack);
}}>
	Play
</button>

<button on:click={async () => {
    Tone.Transport.pause();    
}}>
	Pause
</button>



<style lang="scss">
    .trackContainer {
        display: flex;
        flex-flow: row nowrap;
        overflow-x: auto;
    }

    .trackPadding {
        width: 50%;
        flex-shrink: 0;
    }

    .tracks {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), 50px);
    }
</style>