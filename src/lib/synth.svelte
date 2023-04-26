<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount, tick } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { browser } from '$app/environment';
    import { fade, fly } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    // Tone
    import * as Tone from 'tone';
    // Dexie
    import { db } from "../storage/db";
    // types
    import type {
        TempId,
        TapeName,
        Melody,
        Beats
    } from '../storage/db';
    // stores
    import { firstLoad } from "../storage/store";
    // components
    import CassetteHeader from '$lib/cassetteHeader.svelte';
    import Reels from '$lib/reels.svelte';
    import Controls from '$lib/controls.svelte';
    import BPMslider from '$lib/BPMslider.svelte';
    import KeyboardControls from '$lib/keyboardControls.svelte';
    import Keyboard from '$lib/keyboard.svelte';
    import Soundboard from '$lib/soundboard.svelte';

    /* === PROPS ============================== */
    export let id: TempId = "new";
    export let title = "song #1";
    export let melody: Melody = Array(24).fill([]);
    export let beats: Beats = Array(24).fill([]);
    export let bpm: Tone.Unit.BPM = 80;

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
    let songIsLoaded = false;
    let introHasFinished = false;
    let songIsSaved = false;

    let playbackState: Tone.PlaybackState = "stopped";
    let tweening = false;
    let playbackProgress: number = 0;

    let synth: Tone.PolySynth;
    let players: Tone.Players;
    let playersVol: Tone.Volume;
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
    $: isReady = songIsLoaded && introHasFinished;
    // update database on change
    $: isReady && title && updateTitle();
    $: isReady && melody && updateMelody();
    $: isReady && beats && updateBeats();
    $: isReady && bpm && updateBpm();

    /* === FUNCTIONS ========================== */
    async function newSong(): Promise<void> {
        try {
            const realId = await db.songs.add({
                title,
                melody,
                beats,
                bpm
            });

            songIsSaved = true;

            // update URL
            id = realId;
            goto('/song/' + id, { replaceState: true });

            // update title
            songIsLoaded = true;
            title = "song #" + id;
        } catch (error) {
            console.log("new song error: " + error);
        }
        
    }

    async function getSong(): Promise<void> {
        try {
            // get song from database
            const song = await db.songs.get(id);

            if (!song) {
                await newSong();
                return;
            }

            console.log("song: " + JSON.stringify(song));

            // load song
            title = song.title;
            melody = song.melody;
            beats = song.beats;
            bpm = song.bpm;

            songIsSaved = true
        } catch (error) {
            console.log("song error: " + error);
        }
    }

    async function updateTitle() {
        if (!songIsLoaded) return;

        try {
            // @ts-ignore
            const updated = await db.songs.update(id, { title });
            if (updated < 1) 
                throw new Error("Did not update any songs");
        } catch (error) {
            console.log("update error: " + error);
        }
    }

    async function updateMelody() {
        if (!songIsLoaded) return;
        
        try {
            // @ts-ignore
            const updated = await db.songs.update(id, { melody });
            if (updated < 1) 
                throw new Error("Did not update any songs");
        } catch (error) {
            console.log("update error: " + error);
        }
    }

    async function updateBeats() {
        if (!songIsLoaded) return;
        
        try {
            // @ts-ignore
            const updated = await db.songs.update(id, { beats });
            if (updated < 1) 
                throw new Error("Did not update any songs");
        } catch (error) {
            console.log("update error: " + error);
        }
    }

    async function updateBpm() {
        if (!songIsLoaded) return;
        
        try {
            // @ts-ignore
            const updated = await db.songs.update(id, { bpm });
            if (updated < 1) 
                throw new Error("Did not update any songs");
        } catch (error) {
            console.log("update error: " + error);
        }
    }

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

        beatsPart = new Tone.Part(((time, details) => {
            details.samples.forEach(value => {
                players.player(value).start(time);
            });
        }), beatsToPlay).start(0);

        melodyPart = new Tone.Part(((time, details) => {
            currentSubdiv = details.index;
            synth.triggerAttackRelease(details.note, "16n", time);

            // call readyReels() again on last note, this will create a new part with updated notesToPlay
            if (details.index === notesToPlay.length - 1) readyReels();
        }), notesToPlay).start(0);
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
    onMount(async () => {
        console.log("onMount");
        // time intro 
        if ($firstLoad) {
            $firstLoad = false;
            introHasFinished = true;
        } else {
            setTimeout(() => {
                introHasFinished = true;
                console.log("intro has finished");
                console.log("isReady: " + isReady);
            }, 200);
        }
        
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

        // get song from database
        if (id === "new") {
            await newSong();
        } else {
            await getSong();
        }

        
        songIsLoaded = true;
        console.log("song is loaded");
        console.log("isReady: " + isReady);

        return () => {
            // cancel tapesFrame on destroy
            cancelAnimationFrame(tapesFrame);
        };
    });

    beforeNavigate(() => {
        // unready on naviagation
        introHasFinished = false;
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

<div
    class="synth"
    in:fade={{ duration: 50, delay: 200 }}
    out:fly={{ y: 20, duration: 200 }}>
    <div class="background">
        <div
            class="cassetteHousing top"
            class:isReady>
            <div>
                <CassetteHeader 
                    bind:title = {title}
                    {isReady}/>
            </div>
        </div>
    </div>

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
        {isReady}
        on:pause = {() => Tone.Transport.pause()}
        on:addQuarter = {async () => await addSubdiv(4)}
        on:removeQuarter = {async () => await removeSubdiv(4)} />

    <div
        class="cassetteHousing bottom"
        class:isReady>
        <div>
            <Controls
                {playbackState}
                {currentSubdiv}
                {tweenedProgress}
                {playbackProgress}
                melodyLength = {melody.length}
                {isReady}
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

            <BPMslider
                bind:bpm = {bpm}
                {isReady}
                on:input = {() => Tone.Transport.bpm.value = bpm} />
        </div>
    </div>

    {#if isReady && currentTape === "melody"}
        <div
            id="melodyInputs"
            class="inputs"
            out:fly={{ y: 20, duration: 200 }}>
            <div class="secondaryControls">
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
    {:else if isReady}
        <div
            id="beatsInputs"
            class="inputs"
            out:fly={{ y: 20, duration: 200 }}>
            <Soundboard
                {currentSubdiv}
                bind:beats = {beats}
                {samples}
                on:play = {e => players.player(e.detail.beat).start()}
                on:nextSubDiv = {async () => await skipTo(currentSubdiv + 1)} />
        </div>
    {/if}
</div>



<style lang="scss">
    :root {
        // internal variables
        --_cassette-ani-duration: 0.25s;
        --_cassette-ani-easing: cubic-bezier(.54,.12,.21,1);
    }

    .background {
        position: relative;
        z-index: 1001;
        background-color: var(--clr-100);
    }

    .cassetteHousing {
        // internal variables
        --_border-radius: 10px;

        position: relative;

        padding: 0 10px;
        background-color: var(--clr-100);

        & > div {
            max-width: var(--cassetts-macxWidth);

            border: solid var(--border-width) var(--clr-250);
            margin: 0 auto;
        }

        &.top {
            z-index: 1002;
            padding-top: 10px;

            transition: transform var(--_cassette-ani-duration) var(--_cassette-ani-easing);

            // load state
            transform: translateY(var(--cassettTop-translateY));

            div {
                border-bottom: none;
                border-radius:
                    var(--_border-radius)
                    var(--_border-radius)
                    0
                    0;
            }
        }

        &.bottom > div {
            z-index: 2;
            border-top: none;
            border-radius:
                0
                0
                var(--_border-radius)
                var(--_border-radius);

            transition: transform var(--_cassette-ani-duration) var(--_cassette-ani-easing);

            // load state
            transform: translateY(calc(-1 * var(--reels-height) - var(--tapeMarker-height) + var(--cassettTop-translateY)));
        }

        &.isReady {
            &.top, &.bottom > div {
                // default state
                transform: translateY(0);
            }
        }
    }

    .inputs {
        display: flex;
        gap: var(--pad-2xl);
        max-width: var(--inputs-maxWidth);

        margin: 0 auto;

        animation: inputsLoad var(--_cassette-ani-duration) var(--_cassette-ani-easing) 1;
        animation-delay: 0.2s;
        animation-fill-mode: backwards;
    }

    #melodyInputs {
        flex-flow: row nowrap;
        height: var(--inputs-height);
        max-height: var(--inputs-maxHeight);

        padding: 10px 0 10px var(--pad-2xl);
        
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
            height: unset;
            max-height: unset;
            padding: var(--pad-2xl) 0 var(--pad-2xl) var(--pad-2xl);

            .secondaryControls {
                flex-flow: column-reverse nowrap;
                gap: 20px
            }
        }
    }
    
    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        #melodyInputs {
            flex-flow: column nowrap;
            padding-left: 0;

            .secondaryControls {
                gap: 30px;
                padding: 0 20px;
            }
        }
    }

    /* === ANIMATIONS ========================= */
    @keyframes inputsLoad {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>