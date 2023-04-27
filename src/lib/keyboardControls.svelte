<script lang="ts">
    /* === PROPS ============================== */
    export let currentKbSegment: 0 | 1 | 2; // bind
    export let segmentIsPopulated: boolean[];
</script>



<div class="wrapper">
    <div class="keyboardControls">
        <button
            class:active={currentKbSegment === 0}
            on:click={() => currentKbSegment = 0}>
            1-12
            <div class="indicator" class:populated={segmentIsPopulated[0]}></div>
        </button>
        <button
            class:active={currentKbSegment === 1}
            on:click={() => currentKbSegment = 1}>
            13-24
            <div class="indicator" class:populated={segmentIsPopulated[1]}></div>
        </button>
        <button
            class:active={currentKbSegment === 2}
            on:click={() => currentKbSegment = 2}>
            25-36
            <div class="indicator" class:populated={segmentIsPopulated[2]}></div>
        </button>
    </div>
</div>





<style lang="scss">
    .keyboardControls {
        display: flex;
        flex-direction: column;
        gap: var(--pad-sm);
        position: sticky;
        top: calc(var(--reels-height) + $cassetteBottom-visible + var(--border-width-thick));
    }

    button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;

        white-space: nowrap;

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

    /* === BREAKPOINTS ======================== */
    @media (orientation: portrait) {
        .wrapper {
            flex-grow: 1;
        }
        .keyboardControls {
            flex-direction: column-reverse;
        }
    }

    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .keyboardControls {
            flex-direction: row;
        }
    }

    @media (max-width: calc($cassetts-maxWidth + 20px + 88px)) {
        .keyboardControls {
            top: calc(var(--reels-height) + $cassetteBottom-visible + 2 * var(--pad-md) + 44px);
        }
    }
</style>