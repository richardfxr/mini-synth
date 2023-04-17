<script lang="ts">
    /* === PROPS ============================== */
    export let currentKbSegment: 0 | 1 | 2; // bind
    export let segmentIsPopulated: boolean[];
</script>



<div class="keyboardControls">
    <button
        class:active={currentKbSegment === 0}
        on:click={() => currentKbSegment = 0}>
        A-L
        <div class="indicator" class:populated={segmentIsPopulated[0]}></div>
    </button>
    <button
        class:active={currentKbSegment === 1}
        on:click={() => currentKbSegment = 1}>
        M-Z
        <div class="indicator" class:populated={segmentIsPopulated[1]}></div>
    </button>
    <button
        class:active={currentKbSegment === 2}
        on:click={() => currentKbSegment = 2}>
        0-9
        <div class="indicator" class:populated={segmentIsPopulated[2]}></div>
    </button>
</div>




<style lang="scss">
    .keyboardControls {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;

        background-color: var(--clr-100);
        padding: 10px 10px 8px 10px;
        border: solid 1px var(--clr-250);
        border-radius: 200px;

        transition: border-color 0.15s ease;

        &.active {
            border-color: var(--clr-800);
        }

        .indicator {
            width: 13px;
            height: 2px;
            background-color: var(--clr-0);
            transition: background-color 0.1s ease;

            &.populated {
                background-color: orange;
            }
        }
    }
</style>