<script context="module" lang="ts">
    /* === CONSTANTS ========================== */
    export const notes: Tone.Unit.Frequency[] = [
        "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
        "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
        "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5",
    ];
</script>

<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount, onDestroy, tick } from 'svelte';
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
    import {
        firstLoad,
        synth,
        players,
        playersVol
    } from "../storage/store";
    // components
    import CassetteHeader from '$lib/cassetteHeader.svelte';
    import Reels from '$lib/reels.svelte';
    import Controls from '$lib/controls.svelte';
    import BPMslider from '$lib/BPMslider.svelte';
    import KeyboardControls from '$lib/keyboardControls.svelte';
    import Keyboard from '$lib/keyboard.svelte';
    import Soundboard from '$lib/soundboard.svelte';
    // icons
    import TrashCanIcon from '$lib/SVGs/trashCanIcon.svelte';
    import InsertSubdivIcon from '$lib/SVGs/insertSubdivIcon.svelte';
    import ClearSubdivIcon from '$lib/SVGs/clearSubdivIcon.svelte';
    import AutoSkipIcon from '$lib/SVGs/autoSkipIcon.svelte';

    /* === PROPS ============================== */
    export let id: TempId = "new";
    export let title = "song #1";
    export let melody: Melody = Array(24).fill([]);
    export let beats: Beats = Array(24).fill([]);
    export let bpm: Tone.Unit.BPM = 80;

    /* === CONSTANTS ========================== */
    const subdivWidth = 35;
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

    let melodyPart: Tone.Part;
    let notesToPlay: { time: Tone.Unit.Time, note: Tone.Unit.Frequency[], index: number }[] = [];
    let beatsPart: Tone.Part;
    let beatsToPlay: { time: Tone.Unit.Time, samples: string[] }[] = [];
    let tapesFrame: number;

    let currentTapeName: TapeName = "melody";
    let currentSubdiv: number = 0;
    let autoSkip = true;
    let autoSkipping = false;
    let currentKbSegment: 0 | 1 | 2 = 0;
    let hasManuallyScrolled = false;

    /* === REACTIVE DECLARATIONS ============== */
    // reference to the currently active tape
    $: currentTape = currentTapeName === "melody" ? melody : beats;
    // if each of the three keyboard segments is populated (has at least one note played)
    $: segmentIsPopulated = [
        melody[currentSubdiv].some(e => notesOfSegment[0].includes(e)),
        melody[currentSubdiv].some(e => notesOfSegment[1].includes(e)),
        melody[currentSubdiv].some(e => notesOfSegment[2].includes(e))
    ];
    $: isReady = songIsLoaded && introHasFinished;
    // update database on change
    $: isReady && title && updateSong("title");
    $: isReady && melody && updateSong("melody");
    $: isReady && beats && updateSong("beats");
    $: isReady && bpm && updateSong("bpm");

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

            if (id !== realId) {
                // update URL
                id = realId;
                goto('/song/' + id, { replaceState: true });

            }
            
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

    async function updateSong(property?: string) {
        if (!songIsLoaded) return;

        let updated = 0;

        try {
            // update() calls have ts-ignore due to typing issue with Dexie
            switch (property) {
                case "title":
                    // @ts-ignore
                    updated = await db.songs.update(id, { title });
                    break;
                case "melody":
                    // @ts-ignore
                    updated = await db.songs.update(id, { melody });
                    break;
                case "beats":
                    // @ts-ignore
                    updated = await db.songs.update(id, { beats });
                    break;
                case "bpm":
                    // @ts-ignore
                    updated = await db.songs.update(id, { bpm });
                    break;
                default:
                    // @ts-ignore
                    updated = await db.songs.update(id, { title, melody, beats, bpm });
            }

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
                $players?.player(value).start(time);
            });
        }), beatsToPlay).start(0);

        melodyPart = new Tone.Part(((time, details) => {
            currentSubdiv = details.index;
            $synth?.triggerAttackRelease(details.note, "16n", time);

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
            }, 225);
        }

        // get song from database
        if (id === "new") {
            await newSong();
        } else {
            await getSong();
        }
        songIsLoaded = true;

        // initialize synth
        if ($synth === null) {
            console.log("creating synth");
            $synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    partials: [0, 2, 3, 4],
                }
            }).toDestination();
        }

        // initialize players
        if ($players === null) $players = new Tone.Players({ urls: samples });
        if ($playersVol === null) $playersVol = new Tone.Volume(-4.5).toDestination();
        $players.connect($playersVol);

        // set transporter properties
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = "0:0:" + melody.length;
    });

    beforeNavigate(() => {
        // unready on naviagation
        introHasFinished = false;
    });

    onDestroy(() => {
        // prevent onDestroy() from running on the server
        if (!browser) return;

        cancelAnimationFrame(tapesFrame);

        // Tone
        Tone.Transport.stop();
        Tone.Transport.cancel();
        if (melodyPart) melodyPart.dispose();
        if (beatsPart) beatsPart.dispose();
    });
</script>



<svelte:head>
    <title>{title} | Mini Synth</title>
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
            class="cassette top"
            class:isReady>
            <div class="housing">
                <div class="left screw"></div>
                <div class="right screw"></div>
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
        bind:currentTapeName = {currentTapeName}
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
        class="cassette bottom"
        class:isReady>
        <div class="bottomHousing">
            <div id="left" class="sideButton">
                <div class="wrapper">
                    <button
                        class="button warn"
                        style="--_dir: 1"
                        disabled={!isReady || melody.length <= 1}
                        on:click={async () => {
                            if (currentSubdiv >= melody.length - 1) {
                                await removeSubdiv(1);
                            } else {
                                melody = [...melody.slice(0, currentSubdiv), ...melody.slice(currentSubdiv + 1)];
                            beats = [...beats.slice(0, currentSubdiv), ...beats.slice(currentSubdiv + 1)];
                            }
                        }}>
                        <span class="visuallyHidden">delete current subdiv</span>
                        <TrashCanIcon />
                    </button>
                    <button
                        class="button"
                        style="--_dir: 1"
                        disabled={!isReady}
                        on:click={() => {
                            melody = [...melody.slice(0, currentSubdiv + 1), [], ...melody.slice(currentSubdiv + 1)];
                            beats = [...beats.slice(0, currentSubdiv + 1), [], ...beats.slice(currentSubdiv + 1)];
                        }}>
                        <span class="visuallyHidden">insert new subdiv after current subdiv</span>
                        <InsertSubdivIcon />
                    </button>
                </div>
            </div>
            <div class="housing">
                <div class="left screw"></div>
                <div class="right screw"></div>
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
            <div id="right" class="sideButton">
                <div class="wrapper">
                    <button
                        class="button warn"
                        style="--_dir: -1"
                        disabled={!isReady || currentTape[currentSubdiv].length === 0}
                        on:click={() => {
                            if (currentTapeName === "melody") {
                                melody[currentSubdiv] = [];
                            } else {
                                beats[currentSubdiv] = [];
                            }
                        }}>
                        <span class="visuallyHidden">clear current subdiv</span>
                        <ClearSubdivIcon />
                    </button>
                    <label
                        class="button"
                        style="--_dir: -1"
                        class:active={autoSkip}
                        class:autoSkipping>
                        <input
                            class="visuallyHidden"
                            type="checkbox"
                            bind:checked={autoSkip}
                            disabled={!isReady}>
                        <span class="visuallyHidden">Melody tape</span>
                        <AutoSkipIcon />
                    </label>
                </div>
            </div>
        </div>
        
    </div>

    {#if isReady && currentTapeName === "melody"}
        <div class="inputsWrapper" out:fly={{ y: 20, duration: 200 }}>
            <div
                id="melodyInputs"
                class="inputs">
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
                    {autoSkip}
                    on:keyDown = {e => $synth?.triggerAttack(e.detail.note)}
                    on:keyUp = {e => $synth?.triggerRelease(e.detail.note)}
                    on:nextSubDiv = {async () => {
                        autoSkipping = true;
                        if (currentSubdiv + 1 >= melody.length) {
                            await addSubdiv(4);
                        } else {
                            await skipTo(currentSubdiv + 1);
                        }
                        autoSkipping = false;
                    }}/>
            </div>
        </div>
    {:else if isReady}
        <div class="inputsWrapper" out:fly={{ y: 20, duration: 200 }}>
            <div
                id="beatsInputs"
                class="inputs"
                out:fly={{ y: 20, duration: 200 }}>
                <Soundboard
                    {currentSubdiv}
                    bind:beats = {beats}
                    {samples}
                    {autoSkip}
                    on:play = {e => $players?.player(e.detail.beat).start()}
                    on:nextSubDiv = {async () => {
                        autoSkipping = true;
                        if (currentSubdiv + 1 >= melody.length) {
                            await addSubdiv(4);
                        } else {
                            await skipTo(currentSubdiv + 1);
                        }
                        autoSkipping= false;
                    }} />
            </div>
        </div>
    {/if}
</div>



<style lang="scss">
    // === USE ====================================
    @use "sass:map";
    @use '../styles/colors' as *;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .cassette.bottom {
            .bottomHousing {
                --_clr-shadow: var(--clr-300);
            }
            
            .sideButton .button {
                --_clr-border: var(--clr-400);

                &:hover {
                    --_clr-border: var(--clr-600);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-700);
                }
            
                &:disabled {
                    --_clr-border: var(--clr-250);
                }

                &.autoSkipping {
                    background-color: #ff6b6b;

                    &::before {
                        background-color: #ff8383;
                    }
                }
            }
        } 

        .inputs {
            background-color: var(--clr-800);
        }
    }

    @mixin dark {
        .cassette.bottom {
            .bottomHousing {
                --_clr-shadow: var(--clr-0);
            }

            .sideButton .button {
                --_clr-border: var(--clr-0);

                &:hover {
                    --_clr-border: var(--clr-0);
                }

                &:active, &.active {
                    --_clr-border: var(--clr-0);
                }
            
                &:disabled {
                    --_clr-border: var(--clr-50);
                }
                
                &.autoSkipping {
                    background-color: #f14c4c;

                    &::before {
                        background-color: #ff6363;
                    }
                }
            }
        } 

        .inputs {
            background-color: var(--clr-50);
        }
    }
    
    /* === MAIN STYLES ======================== */
    @include light;

    .background {
        position: relative;
        z-index: 1001;
        background-color: var(--clr-50);
    }

    .cassette {
        position: relative;

        padding: 0 $page-pad-hrz;

        .housing {
            position: relative;
            max-width: $cassetts-maxWidth;

            border: solid var(--border-width-thick) var(--clr-cassette-border);
            margin: 0 auto;

            &::before {
                // main color
                content: "";
                position: absolute;
                right: 0;
                left: 0;

                background-color: var(--clr-cassette-bg);
                border-right: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
                border-left: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
            }

            .screw {
                position: absolute;
                width: $cassette-screw-size;
                height: $cassette-screw-size;
                z-index: 10;

                background-color: var(--clr-cassette-cutout-bg);
                border-radius: var(--borderRadius-round);

                &.left {
                    left: var(--pad-sm);
                }

                &.right {
                    right: var(--pad-sm);
                }
            }
        }

        &.top {
            z-index: 1002;
            padding-top: 10px;

            transition: transform $cassette-ani-duration $cassette-ani-easing;

            // load state
            transform: translateY(var(--cassettTop-translateY));

            .housing {
                background-color: var(--clr-cassette-bg-highlight);
                border-bottom: none;
                border-radius:
                    $cassette-border-radius
                    $cassette-border-radius
                    0
                    0;

                &::before {
                    top: $cassette-shading-size;
                    bottom: 0;
                    border-radius:
                        calc($cassette-border-radius - var(--border-width))
                        calc($cassette-border-radius - var(--border-width))
                        0
                        0;
                }

                .screw {
                    top: var(--pad-sm);
                }
            }
        }

        &.bottom {
            position: sticky;
            top: calc(var(--reels-height) - $cassetteBottom-height + $cassetteBottom-visible);
            z-index: 999;

            padding: 0 0 var(--pad-xl) 0;

            // load state
            transform: translateY(calc(-1 * var(--reels-height) - var(--tapeMarker-height) + var(--cassettTop-translateY)));
            
            transition: transform $cassette-ani-duration $cassette-ani-easing;
            
            .bottomHousing {
                display: flex;
                flex-flow: row nowrap;
                justify-content: center;
                gap: var(--pad-xl);
                width: 100%;
            }

            .housing {
                flex-grow: 1;
                z-index: 2;

                background-color: var(--clr-cassette-bg-shadow);
                padding-bottom: var(--pad-xs);
                border-top: none;
                border-radius:
                    0
                    0
                    $cassette-border-radius
                    $cassette-border-radius;
                margin: 0;

                &::before {
                    top: 0;
                    bottom: $cassette-shading-size;
                    border-radius:
                        0
                        0
                        calc($cassette-border-radius - var(--border-width))
                        calc($cassette-border-radius - var(--border-width));
                }

                .screw {
                    bottom: var(--pad-sm);
                }
            }

            .sideButton {
                padding-top: var(--pad-md);

                .wrapper {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: var(--pad-sm);
                    position: sticky;
                    top: calc(var(--reels-height) + var(--pad-md));
                }

                .button {
                    transition: transform var(--trans-normal) var(--trans-cubic-1),
                                opacity var(--trans-normal) var(--trans-cubic-1);

                    // load state
                    transform: translateX(calc(var(--_dir) * 50px));
                    opacity: 0;
                }
            }
        }

        &.isReady {
            &.top, &.bottom {
                // default state
                transform: translateY(0);
            }

            &.bottom .sideButton .button {
                // default state
                transform: translateY(0);
                opacity: 1;
            }
        }
    }

    .inputsWrapper {
        width: 100%;

        padding: 0 $page-pad-hrz;

        animation: inputsLoad $cassette-ani-duration $cassette-ani-easing 1;
        animation-delay: 0.2s;
        animation-fill-mode: backwards;
    }

    .inputs {
        display: flex;
        max-width: var(--inputs-maxWidth);

        border: solid var(--border-width-thick) map.get($light, 1000);
        border-radius: calc($input-border-radius + var(--border-width-thick));
        margin: 0 auto;
    }

    #melodyInputs {
        flex-flow: row nowrap;
        min-height: 129px;
        height: var(--inputs-height);
        max-height: var(--inputs-maxHeight);
        
        .secondaryControls {
            display: flex;
            flex-flow: row nowrap;
            gap: 10px;
        }
    }

    #beatsInputs {
        flex-direction: column;
        align-items: center;
    }

    /* === COLOR SCHEME ======================= */
    :global([data-colorScheme="dark"]) { @include dark; }

    @media (prefers-color-scheme: dark) {
        @include dark;

        :global([data-colorScheme="light"]) {
            @include light;
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .inputs {
            max-width: $cassetts-maxWidth;
        }

        #melodyInputs {
            height: unset;
            max-height: unset;

            .secondaryControls {
                flex-flow: column-reverse nowrap;
                gap: 20px
            }
        }
    }
    
    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .inputs {
            margin: 0 var(--pad-xl);
        }

        #melodyInputs {
            flex-flow: column nowrap;
            min-height: calc(170px + var(--pad-2xl));
        }
    }

    @media (max-width: calc($cassetts-maxWidth + 28px + 176px)) {
        .cassette.bottom {
            padding: 0 var(--pad-xl) var(--pad-xl) var(--pad-xl);

            .bottomHousing {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                grid-template-areas: 
                    "housing housing"
                    "leftButton rightButton";
                gap: var(--pad-md);
                position: relative;
                max-width: $cassetts-maxWidth;

                background-color: var(--_clr-shadow);
                border: solid var(--border-width-thick) var(--clr-cassette-border);
                border-top: none;
                border-radius:
                    0
                    0
                    $cassette-border-radius
                    $cassette-border-radius;
                margin: 0 auto;

                &::before {
                    // main color
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: $highlight-height;
                    left: 0;

                    background-color: var(--clr-cassette-bg-shadow);
                    border-radius:
                        0
                        0
                        $cassette-border-radius
                        $cassette-border-radius;
                }
            }
            
            .housing {
                grid-area: housing;
                max-width: unset;
                border: none;
            }

            .sideButton {
                padding: 0 var(--pad-xl) var(--pad-lg) var(--pad-xl);

                &#right {
                    margin-left: auto;
                }
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