<script context="module" lang="ts">
    /* === TYPES ============================== */
    export type TapeName = "melody" | "beats";
    export type Tape = Tone.Unit.Frequency[][] | string[][];
</script>

<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment';
    import { fade } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tone from 'tone';
    import Reels from '$lib/reels.svelte';
    import Controls from '$lib/controls.svelte';
    import BPMslider from '$lib/BPMslider.svelte';
    import KeyboardControls from '$lib/keyboardControls.svelte';
    import Keyboard from '$lib/keyboard.svelte';
    import Soundboard from '$lib/soundboard.svelte';

    /* === PROPS ============================== */
    export let melody: Tone.Unit.Frequency[][] = Array(24).fill([]);
    export let beats: string[][] = Array(24).fill([]);

    /* === CONSTANTS ========================== */
    const subdivWidth = 35;
    const notes: Tone.Unit.Frequency[] = [
        "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
        "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
        "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5",
    ];

    const notesOfSegment: Tone.Unit.Frequency[][] = [
        ["C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3"],
        ["C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4"],
        ["C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5"],
    ];
    const samples: { [key: string]: string} = {
        "hh": "/audio/CR78/hihat.wav",
        "kc": "/audio/CR78/kick.wav",
        "sn": "/audio/KPR77/snare.wav",
        "t1": "/audio/CR78/tom1.wav",
        "t2": "/audio/CR78/tom2.wav",
        "t3": "/audio/CR78/tom3.wav",
    };
    const tweenedProgress = tweened(0, {
		duration: (from, to) => {
            // min duration of 100 ms and increases by 0.1 ms per additional pixel
            return 100 + 0.1 * Math.max(0, Math.abs(to - from) - subdivWidth);
        },
		easing: cubicOut
	});

    /* === VARIABLES ========================== */
    let playbackState: Tone.PlaybackState = "stopped";
    let tweening = false;
    let playbackProgress: number = 0;

    let synth: Tone.PolySynth;
    let players: Tone.Players;
    let playersVol: Tone.Volume;
    let bpm: Tone.Unit.BPM = 80;
    let melodyPart: Tone.Part;
    let notesToPlay: { time: Tone.Unit.Time, note: Tone.Unit.Frequency[], index: number }[] = [];
    let beatsPart: Tone.Part;
    let beatsToPlay: { time: Tone.Unit.Time, samples: string[] }[] = [];
    let tapesFrame: number;

    let currentTape: TapeName = "melody";
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
    function readyReels(): void {
        Tone.Transport.loopEnd = "0:0:" + melody.length;

        // initialize/update notesToPlay
        melody.forEach((subdiv, index) =>{
            const time = "0:0:" + index;
            notesToPlay[index] = {
                time,
                note: subdiv,
                index
            };
        });

        // initialize/update beatsToPlay
        beats.forEach((subdiv, index) =>{
            const time = "0:0:" + index;
            beatsToPlay[index] = {
                time,
                samples: subdiv
            };
        });

        // dispose of parts if they already exists
        if (melodyPart) melodyPart.dispose();
        if (beatsPart) beatsPart.dispose();

        melodyPart = new Tone.Part(((time, details) => {
            currentSubdiv = details.index;
            synth.triggerAttackRelease(details.note, "16n", time);

            // call readyReels() again on last note, this will create a new part with updated notesToPlay
            if (details.index === notesToPlay.length - 1) readyReels();
        }), notesToPlay).start(0);

        beatsPart = new Tone.Part(((time, details) => {
            details.samples.forEach(value => {
                players.player(value).start(time);
            });
        }), beatsToPlay).start(0);
    }

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

    async function addSubdiv(length: number): Promise<void> {
        if (length <= 0) return;

        const subDivToSkipTo = melody.length;
        const subDivsToAdd = Array(length).fill([]);

        // add subdivs to melody and beats
        // (not using push() to force Svelte to update)
        melody = [...melody, ...subDivsToAdd];
        beats = [...beats, ...subDivsToAdd];

        // skip to first added subDiv
        await skipTo(subDivToSkipTo);
    }

    async function removeSubdiv(length: number): Promise<void> {
        if (
            length <= 0 ||
            melody.length - length < 1
        ) return;

        // skip to last subDiv (after removal)
        await skipTo(melody.length - 1 - length);

        // add subdivs to melody and beats
        // (reassigns each array to force Svelte to update)
        melody.splice(-1 * length)
        melody = melody;
        beats.splice(-1 * length)
        beats = beats;
    }

    /* === LIFECYCLES ========================= */
    onMount(() => {
        // initialize synth
        synth = new Tone.PolySynth(Tone.Synth, {
			oscillator: {
				partials: [0, 2, 3, 4],
			}
		}).toDestination();

        // initialize players
        players = new Tone.Players({ urls: samples });
        playersVol = new Tone.Volume(-4.5).toDestination();
        players.connect(playersVol);

        // set transporter properties
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = "0:0:" + melody.length;

        // readyReels();

        return () => {
            // cancel tapesFrame on destroy
            cancelAnimationFrame(tapesFrame);
        };
    });
</script>



<svelte:head>
    <!--
        disable zoom, this is an accessibility concern but multi-touch is
        unusable without it
    -->
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no">
</svelte:head>

<Reels
    {playbackState}
    {tweening}
    {tweenedProgress}
    {subdivWidth}
    bind:currentTape = {currentTape}
    bind:currentSubdiv = {currentSubdiv}
    {melody}
    {notes}
    {beats}
    bind:hasManuallyScrolled = {hasManuallyScrolled}
    on:pause = {() => Tone.Transport.pause()}
    on:addQuarter = {async () => await addSubdiv(4)}
    on:removeQuarter = {async () => await removeSubdiv(4)} />

<Controls
    {playbackState}
    {currentSubdiv}
    {tweenedProgress}
    {playbackProgress}
    melodyLength = {melody.length}
    on:skipToBeginning = {async () => await skipTo(0)}
    on:prevSubdiv = {async () => await skipTo(currentSubdiv - 1)}
    on:play = {async () => {
        await Tone.loaded();
        await Tone.start();
        readyReels();

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

{#if currentTape === "melody"}
    <div id="melodyInputs" class="inputs" in:fade={{ duration: 200 }}>
        <div class="secondaryControls">
            <BPMslider
                bind:bpm = {bpm}
                on:input = {() => Tone.Transport.bpm.value = bpm} />

            <KeyboardControls
                bind:currentKbSegment = {currentKbSegment}
                {segmentIsPopulated} />
        </div>

        <Keyboard
            {currentSubdiv}
            {currentKbSegment}
            bind:melody = {melody}
            {notes}
            {notesOfSegment}
            on:keyDown = {e => synth.triggerAttack(e.detail.note)}
            on:keyUp = {e => synth.triggerRelease(e.detail.note)}
            on:nextSubDiv = {async () => await skipTo(currentSubdiv + 1)}/>
    </div>
{:else}
    <div id="beatsInputs" class="inputs" in:fade={{ duration: 200 }}>
        <BPMslider
            bind:bpm = {bpm}
            layout = "horizontal"
            on:input = {() => Tone.Transport.bpm.value = bpm} />

        <Soundboard
            {currentSubdiv}
            bind:beats = {beats}
            {samples}
            on:play = {e => players.player(e.detail.beat).start()}
            on:nextSubDiv = {async () => await skipTo(currentSubdiv + 1)} />
    </div>
{/if}



<style lang="scss">
    .inputs {
        display: flex;
        gap: 20px;
        max-width: var(--inputs-maxWidth);

        margin: 0 auto;
    }

    #melodyInputs {
        flex-flow: row nowrap;
        height: var(--inputs-height);
        max-height: var(--inputs-maxHeight);

        padding: 10px 0 10px 10px;
        
        .secondaryControls {
            display: flex;
            flex-flow: row nowrap;
            gap: 10px;
        }
    }

    #beatsInputs {
        flex-direction: column;
        align-items: center;
        padding: 15px;
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        #melodyInputs {
            gap: 15px;
            height: unset;
            max-height: unset;
            padding: 15px 0 15px 15px;

            .secondaryControls {
                flex-flow: column-reverse nowrap;
                gap: 20px
            }
        }
    }
    
    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        #melodyInputs {
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