<script lang="ts">
    /* === PROPS ============================== */
    export let currentKbSegment: 0 | 1 | 2; // bind
    export let segmentIsPopulated: boolean[];
</script>



<div class="wrapper">
    <div class="keyboardControls">
        <button
            class="button"
            class:active={currentKbSegment === 0}
            on:click={() => currentKbSegment = 0}>
            1-12
            <div class="indicator" class:populated={segmentIsPopulated[0]}></div>
        </button>
        <button
            class="button"
            class:active={currentKbSegment === 1}
            on:click={() => currentKbSegment = 1}>
            13-24
            <div class="indicator" class:populated={segmentIsPopulated[1]}></div>
        </button>
        <button
            class="button"
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

    .button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        position: relative;
        width: unset;

        white-space: nowrap;

        padding: 10px 10px 8px 10px;
        margin: 0 var(--pad-2xl) 0 0;

        &::before {
            // internal variables
            --_clr: var(--clr-200);
            // keyboard connector
            content: "";
            position: absolute;
            top: calc(50% - var(--border-width-thick));
            right: calc(-1 * var(--pad-2xl) - var(--border-width));
            width: calc(var(--pad-2xl) + var(--border-width));
            z-index: -1;
            
            border-top: solid var(--border-width-thick) var(--_clr);
            border-bottom: solid var(--border-width) var(--clr-0);

            transition: border-color var(--trans-normal) ease;
        }

        &.active {
            &::before {
                // keyboard connector
                --_clr: var(--clr-600);
            }

            .indicator {
                background-color: var(--clr-100);
            }
        }

        .indicator {
            width: 13px;
            height: 2px;
            background-color: var(--clr-0);
            transition: background-color 0.1s ease;

            &.populated {
                background-color: red;
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

            .button {
                margin: 0 0 var(--pad-2xl) 0;

                &::before {
                    // keyboard connector
                    top: unset;
                    right: calc(50% - var(--border-width-thick));
                    bottom: calc(-1 * var(--pad-2xl) - var(--border-width));
                    height: calc(var(--pad-2xl) + var(--border-width));
                    z-index: -1;
                    
                    border-top: none;
                    border-right: solid var(--border-width-thick) var(--_clr);
                    border-bottom: none;
                    border-left: solid var(--border-width) var(--clr-0);
                }
            }
        }
    }

    @media (max-width: calc($cassetts-maxWidth + 20px + 88px)) {
        .keyboardControls {
            top: calc(var(--reels-height) + $cassetteBottom-visible + 2 * var(--pad-md) + 44px);
        }
    }
</style>