<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tone from 'tone';
    import Reels from '$lib/reels.svelte';
    import Controls from '$lib/controls.svelte';
    import BPMslider from '$lib/BPMslider.svelte';
    import KeyboardControls from '$lib/keyboardControls.svelte';
    import Keyboard from '$lib/keyboard.svelte';

    /* === CONSTANTS ========================== */
    const subdivWidth = 50;
    const charOf: { [key: Tone.Unit.Frequency]: String } = {
        C3: "A",
        Db3: "B",
        D3: "C",
        Eb3: "D",
        E3: "E",
        F3: "F",
        Gb3: "G",
        G3: "H",
        Ab3: "I",
        A3: "J",
        Bb3: "K",
        B3: "L",
        C4: "M",
        Db4: "N",
        D4: "O",
        Eb4: "P",
        E4: "Q",
        F4: "R",
        Gb4: "S",
        G4: "T",
        Ab4: "U",
        A4: "V",
        Bb4: "W",
        B4: "X",
        C5: "Y",
        Db5: "Z",
        D5: "0",
        Eb5: "1",
        E5: "2",
        F5: "3",
        Gb5: "4",
        G5: "5",
        Ab5: "6",
        A5: "7",
        Bb5: "8",
        B5: "9",
    };
    const notesOfSegment: Tone.Unit.Frequency[][] = [
        ["C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3"],
        ["C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4", "C5", "Db5"],
        ["D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5"],
    ];
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
    let now: number;
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
    let currentKbSegment: 0 | 1 | 2 = 0;
    let hasManuallyScrolled = false;

    /* === REACTIVE DECLARATIONS ============== */
    // if each of the three keyboard segments is populated (has at least one note played)
    $: segmentIsPopulated = [
        melody[currentSubdiv].some(e => notesOfSegment[0].includes(e)),
        melody[currentSubdiv].some(e => notesOfSegment[1].includes(e)),
        melody[currentSubdiv].some(e => notesOfSegment[2].includes(e))
    ];

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
        // set now
        now = Tone.now();

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
    {tweening}
    {tweenedProgress}
    {subdivWidth}
    bind:currentSubdiv = {currentSubdiv}
    {melody}
    bind:hasManuallyScrolled = {hasManuallyScrolled}
    on:pause = {() => Tone.Transport.pause()} />

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

<div class="inputs">
    <div class="secondaryControls">
        <BPMslider
            bind:bpm = {bpm}
            on:input = {() => Tone.Transport.bpm.value = bpm} />

        <KeyboardControls
            bind:currentKbSegment = {currentKbSegment}
            {segmentIsPopulated} />
    </div>

    <Keyboard
        {charOf}
        {notesOfSegment}
        on:keyDown = {e => synth.triggerAttack(e.detail.note)}
        on:keyUp = {e => synth.triggerRelease(e.detail.note)}/>
    </div>




<style lang="scss">
    .inputs {
        display: flex;
        flex-flow: row nowrap;
        gap: 20px;
        max-width: var(--inputs-maxWidth);
        height: var(--inputs-height);
        max-height: var(--inputs-maxHeight);

        padding: 10px 0 10px 10px;
        margin: 0 auto;

        .secondaryControls {
            display: flex;
            flex-flow: row nowrap;
            gap: 10px;
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .inputs {
            gap: 15px;
            height: unset;
            max-height: unset;
            padding: 15px 0 15px 15px;

            .secondaryControls {
                flex-flow: column-reverse nowrap;
                justify-content: space-between;
            }
        }
    }
    
    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .inputs {
            flex-flow: column nowrap;
            gap: 15px;
            padding-left: 0;

            .secondaryControls {
                gap: 30px;
                padding: 0 20px;
            }
        }
    }
</style>