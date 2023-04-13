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



<style lang="scss">
    .controls {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 10px;
        padding: 20px 0;

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
</style>