<script lang="ts">
    /* === IMPORTS ============================ */
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tone from 'tone';
    import type { BPM } from 'tone/build/esm/core/type/Units';

    /* === CONSTANTS ========================== */
    const subdivWidth = 50;
    const tweenDuration = 100;
    const progress = tweened(0, {
		duration: tweenDuration,
		easing: cubicOut
	});

    /* === VARIABLES ========================== */
    let synth: Tone.PolySynth;
    let bpm: BPM = 80;
    let melody: Tone.Unit.Frequency[][] = [];
    let melodyPart: Tone.Part;
    let notesToPlay: {time: Tone.Unit.Time, note: Tone.Unit.Frequency[], index: number}[] = [];

    let trackContainer: HTMLElement;
    let trackFrame: number;
    let currentSubdiv: number = 0;
    
    let autoScroll = false;
    let hasManuallyScrolled = false;
    
    /* === FUNCTIONS ========================== */
    function scrollTrack(): void {
        console.log("Tone.Transport.state: " + Tone.Transport.state);
        if (!browser || !trackContainer || Tone.Transport.state !== "started") return;

        console.log("scrolling");

        const trackLength = melody.length * subdivWidth;
        progress.set(Tone.Transport.progress * trackLength);

        // console.log("progress: " + Tone.Transport.progress);
        // console.log("trackLength: " + trackLength);
        // console.log("srollLeft: " + Tone.Transport.progress * trackLength);

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

        progress.subscribe(() => {
            // set scrollLeft using progress (tweened)
            if (autoScroll) {
                // console.log("progress: " + $progress);
                trackContainer.scrollLeft = $progress;
            }
        });

        return () => {
            cancelAnimationFrame(trackFrame);
        };
    });
</script>


<div class="playerContainer">
    <div
        class="trackContainer"
        bind:this={trackContainer}
        on:scroll={() => {
            // update progress if it is not updating scroll
            if (!autoScroll) {
                progress.set(trackContainer.scrollLeft);
                currentSubdiv = Math.floor(trackContainer.scrollLeft / subdivWidth);
                hasManuallyScrolled = true;
            }
        }}>
        <div class="trackPadding"></div>
        <div
            class="tracks"
            style="--melodyLength: {melody.length}">
            {#each melody as subdiv, i}
                <div
                    class="subdiv"
                    class:active={i === currentSubdiv}>
                    {#each subdiv as note}
                        <p>{note}</p>
                    {/each}
                </div>
            {/each}
        </div>
        <div class="trackPadding"></div>
    </div>
</div>

<div class="controls">
    <button on:click={async () => {
        await Tone.start();

        if (hasManuallyScrolled) {
            // start transport at current readhead location
            Tone.Transport.start("+0", "0:0:" + currentSubdiv);
        } else {
            Tone.Transport.start();
        }
        
        autoScroll = true;
        console.log("begins at: " + trackContainer.scrollLeft);
        trackFrame = requestAnimationFrame(scrollTrack);
    }}>
        Play
    </button>

    <button on:click={async () => {
        Tone.Transport.pause();
        setTimeout(() => {
            autoScroll = false;
            hasManuallyScrolled = false;
        }, tweenDuration);
    }}>
        Pause
    </button>
</div>



<style lang="scss">
    .playerContainer {
        position: relative;
        padding: 10px 0;
        
        &::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: calc(50% - 0.5px);
            width: 1px;
            z-index: 1000;
            background-color: red;
        }
    }

    .trackContainer {
        display: flex;
        flex-flow: row nowrap;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
    }

    .trackPadding {
        width: 50%;
        flex-shrink: 0;
    }

    .tracks {
        display: grid;
        grid-template-columns: repeat(var(--melodyLength), 50px);
        background-color: var(--clr-100);

        .subdiv {
            display: flex;
            flex-direction: column;
            gap: 1px;
            padding: 10px 0.5px;

            &.active {
                background-color: var(--clr-150);
            }

            p {
                color: var(--clr-0);

                background-color: var(--clr-800);
                padding: 3px;
                border-radius: 2px;
            }
        }
    }

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