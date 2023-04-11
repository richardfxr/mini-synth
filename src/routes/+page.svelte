<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tone from 'tone';
    import Reels from '../lib/reels.svelte';

    /* === CONSTANTS ========================== */
    const subdivWidth = 50;
    const tweenDuration = 100;
    const tweenedProgress = tweened(0, {
		duration: tweenDuration,
		easing: cubicOut
	});

    /* === VARIABLES ========================== */
    let playbackState: Tone.PlaybackState = "stopped";
    let playbackProgress: number = 0;

    let synth: Tone.PolySynth;
    let bpm: Tone.Unit.BPM = 80;
    let melody: Tone.Unit.Frequency[][] = [
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
    let melodyPart: Tone.Part;
    let notesToPlay: {time: Tone.Unit.Time, note: Tone.Unit.Frequency[], index: number}[] = [];
    let tapesFrame: number;

    let currentSubdiv: number = 0;
    
    // let autoScroll = false;
    let hasManuallyScrolled = false;

    /* === FUNCTIONS ========================== */
    function scrollTapes(): void {
        if (!browser) return;

        playbackState = Tone.Transport.state;
        playbackProgress = Tone.Transport.progress;

        if (playbackState !== "started") return;

        const trackLength = melody.length * subdivWidth;
        tweenedProgress.set(playbackProgress * trackLength);

        // console.log("progress: " + Tone.Transport.progress);
        // console.log("trackLength: " + trackLength);
        // console.log("srollLeft: " + Tone.Transport.progress * trackLength);

        tapesFrame = requestAnimationFrame(scrollTapes);
    };

    function startTapes(): void {
        tapesFrame = requestAnimationFrame(scrollTapes);
    }

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

        melody.forEach((subdiv, index) =>{
            const time = "0:0:" + index;
            notesToPlay[index] = {
                time,
                note: subdiv,
                index
            };
        })

        melodyPart = new Tone.Part(((time, details) => {
            console.log("index: " + details.index);
            currentSubdiv = details.index;
            // console.log(JSON.stringify(note) + " @ " + Tone.Time(time).toBarsBeatsSixteenths());
            synth.triggerAttackRelease(details.note, "16n", time);
        }), notesToPlay).start(0);

        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = "0:0:" + notesToPlay.length;

        return () => {
            // cancel tapesFrame on destroy
            cancelAnimationFrame(tapesFrame);
        };
    });
</script>


<Reels
    {playbackState}
    {tweenedProgress}
    {subdivWidth}
    bind:currentSubdiv = {currentSubdiv}
    {melody}
    bind:hasManuallyScrolled = {hasManuallyScrolled} />

<div class="controls">
    <button on:click={async () => {
        await Tone.start();

        if (hasManuallyScrolled) {
            // start transport at current readhead location
            Tone.Transport.start("+0", "0:0:" + currentSubdiv);
        } else {
            Tone.Transport.start();
        }

        startTapes();

        console.log("Tone.Transport.state: " + Tone.Transport.state);
    }}>
        Play
    </button>

    <button on:click={async () => {
        Tone.Transport.pause();
    }}>
        Pause
    </button>
</div>



<style lang="scss">
    .controls {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 10px;
        padding: 20px 0;

        button {
            width: 100px;
            background-color: var(--clr-100);
            padding: 10px 0;
            border: solid 1px var(--clr-250);
            border-radius: 200px;
        }
    }
</style>