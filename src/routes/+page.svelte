<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tone from 'tone';
    import Reels from '$lib/reels.svelte';
    import Controls from '$lib/controls.svelte';

    /* === CONSTANTS ========================== */
    const subdivWidth = 50;
    const tweenedProgress = tweened(0, {
		duration: (from, to) => {
            // min duration of 100 ms and increases by 0.1 ms per additional pixel
            return 100 + 0.1 * Math.max(0, Math.abs(to - from) - 50);
        },
		easing: cubicOut
	});

    /* === VARIABLES ========================== */
    let playbackState: Tone.PlaybackState = "stopped";
    let tweening = false;
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
    async function scrollTapes() {
        if (!browser) return;

        playbackState = Tone.Transport.state;
        playbackProgress = Tone.Transport.progress;
        const scrollAmount = playbackProgress * melody.length * subdivWidth;

        if (playbackState !== "started") {
            // set tweening to false after last tweened (upon pause) animation completes
            await tweenedProgress.set(scrollAmount);
            await tick();
            tweening = false;
            return;
        };

        tweenedProgress.set(scrollAmount);

        tapesFrame = requestAnimationFrame(scrollTapes);
    };

    function startTapes(): void {
        tweening = true;
        tapesFrame = requestAnimationFrame(scrollTapes);
    }

    /**
     * Skip to specified subdiv index. Only functions when not playing
     * @param relativeIndex index between 0 and (melody.length - 1)
     */
    async function skipTo(index: number): Promise<void> {
        if (
            playbackState === "started" ||
            index < 0 ||
            index >= melody.length
        ) return;

        // handle tweenedProgress and scrolling
        hasManuallyScrolled = true;
        tweening = true;
        currentSubdiv = index;

        // await tweened animation to finish
        await tweenedProgress.set(currentSubdiv * subdivWidth);
        await tick();
        
        tweening = false;
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
    {tweening}
    {tweenedProgress}
    {subdivWidth}
    bind:currentSubdiv = {currentSubdiv}
    {melody}
    bind:hasManuallyScrolled = {hasManuallyScrolled} />

<Controls
    {playbackState}
    {currentSubdiv}
    melodyLength = {melody.length}
    on:skipToBeginning = {async () => await skipTo(0)}
    on:prevSubdiv = {async () => await skipTo(currentSubdiv - 1)}
    on:play = {async () => {
        await Tone.start();

        if (hasManuallyScrolled) {
            // reset manual scroll
            hasManuallyScrolled = false;
            // start transport at current readhead location
            Tone.Transport.start("+0", "0:0:" + currentSubdiv);
        } else {
            Tone.Transport.start();
        }

        startTapes();
    }}
    on:pause = {() => Tone.Transport.pause()}
    on:nextSubdiv = {async () => await skipTo(currentSubdiv + 1)}
    on:skipToEnd = {async () => await skipTo(melody.length - 1)} />



<style lang="scss">
    
</style>