<script lang="ts">
    /* === IMPORTS ============================ */
    import { createEventDispatcher } from 'svelte';
    import type * as Tone from 'tone';

    /* === PROPS ============================== */
    export let playbackState: Tone.PlaybackState;
    export let currentSubdiv: number;
    export let melodyLength: number;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
</script>



<div class="controls">
    <div class="timecode">
        <p>{Math.floor(currentSubdiv / 16)}:{Math.floor(currentSubdiv / 4) % 4}:{currentSubdiv % 4}</p>
    </div>

    <div class="playback">
        <button
            class="small"
            on:click = {() => dispatch('skipToBeginning')}
            disabled = {playbackState === "started" || currentSubdiv <= 0}>
            ⇤
        </button>

        <button
            class="small"
            on:click = {() => dispatch('prevSubdiv')}
            disabled = {playbackState === "started" || currentSubdiv <= 0}>
            ←
        </button>

        <button class="main" on:click={() => {
            playbackState === "started" ? dispatch('pause') : dispatch('play')
        }}>
            {#if playbackState === "started"}
                <span>Pause</span>
            {:else}
                <span>Play</span>
            {/if}
        </button>

        <button
            class="small"
            on:click = {() => dispatch('nextSubdiv')}
            disabled = {playbackState === "started" || currentSubdiv >= melodyLength - 1}>
            →
        </button>

        <button
            class="small"
            on:click = {() => dispatch('skipToEnd')}
            disabled = {playbackState === "started" || currentSubdiv >= melodyLength - 1}>
            ⇥
        </button>
    </div>

    <div class="subdivIndicators">
        <div class:active={playbackState === "started"}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 1}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 2}></div>
        <div class:active={playbackState === "started" && currentSubdiv % 4 >= 3}></div>
    </div>
</div>



<style lang="scss">
    .controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .timecode {
        padding-top: 10px;
    }

    .playback {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 10px;

        button {
            background-color: var(--clr-100);
            padding-top: 10px;
            padding-bottom: 10px;
            border: solid 1px var(--clr-250);
            border-radius: 200px;

            &.main {
                width: 100px;
            }

            &.small {
                padding-left: 10px;
                padding-right: 10px;
            }
        }
    }

    .subdivIndicators {
        display: flex;
        flex-direction: row;
        gap: 4px;

        & > div {
            width: 13px;
            height: 2px;
            background-color: var(--clr-100);
            transition: background-color 0.15s ease;

            &.active {
                background-color: red;
            }
        }
    }
</style>