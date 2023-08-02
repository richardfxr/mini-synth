<script lang="ts">
    /* === IMPORTS ============================ */
    // helpers
    import { stopPropagation } from "$lib/helpers";

    /* === PROPS ============================== */
    export let currentKbSegment: 0 | 1 | 2; // bind
    export let segmentIsPopulated: boolean[];
</script>



<form
    class="wrapper"
    aria-label="keyboard controls"
    on:submit|preventDefault>
    <div class="keyboardControls">
        <div class="input">
            <input
                id="kbSegment-0"
                class="kbSegmentRadio visuallyHidden"
                type="radio"
                value={0}
                aria-controls="keyboard"
                bind:group={currentKbSegment}
                on:keydown={e => stopPropagation(e, ['Space'])} />
            <label for="kbSegment-0" class="kbSegmentLabel button">
                <span class="visuallyHidden">show notes </span>
                1-12
                <div class="indicator" class:populated={segmentIsPopulated[0]}>
                    <span class="visuallyHidden" style="display: {segmentIsPopulated[0] ? "block" : "none"}">(has pressed keys)</span>
                </div>
            </label>
        </div>

        <div class="input">
            <input
                id="kbSegment-1"
                class="kbSegmentRadio visuallyHidden"
                type="radio"
                value={1}
                aria-controls="keyboard"
                bind:group={currentKbSegment}
                on:keydown={e => stopPropagation(e, ['Space'])} />
            <label for="kbSegment-1" class="kbSegmentLabel button">
                <span class="visuallyHidden">show notes </span>
                13-24
                <div class="indicator" class:populated={segmentIsPopulated[1]}>
                    <span class="visuallyHidden" style="display: {segmentIsPopulated[1] ? "block" : "none"}">(has pressed keys)</span>
            </label>
        </div>

        <div class="input">
            <input
                id="kbSegment-2"
                class="kbSegmentRadio visuallyHidden"
                type="radio"
                value={2}
                aria-controls="keyboard"
                bind:group={currentKbSegment}
                on:keydown={e => stopPropagation(e, ['Space'])} />
            <label for="kbSegment-2" class="kbSegmentLabel button">
                <span class="visuallyHidden">show notes </span>
                25-36
                <div class="indicator" class:populated={segmentIsPopulated[2]}>
                    <span class="visuallyHidden" style="display: {segmentIsPopulated[2] ? "block" : "none"}">(has pressed keys)</span>
            </label>
        </div>
    </div>
</form>



<style lang="scss">
    // === USE ====================================
    @use "sass:map";
    @use '../styles/colors' as *;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .kbSegmentRadio:checked + .kbSegmentLabel {
            --_clr: var(--clr-0);
            --_clr-background: var(--clr-700);
            --_clr-highlight: var(--clr-800);
            --_clr-border: var(--clr-1000);
        }
        .kbSegmentLabel {
            // internal variables 
            --_clr: var(--clr-100);
            --_clr-background: var(--clr-800);
            --_clr-highlight: var(--clr-700);
            --_clr-border: var(--clr-1000);

            &:hover {
                --_clr: var(--clr-0);
                --_clr-border: var(--clr-1000);
            }
        }
    }

    @mixin dark {
        .kbSegmentRadio:checked + .kbSegmentLabel {
            --_clr: var(--clr-1000);
            --_clr-background: var(--clr-150);
            --_clr-highlight: var(--clr-50);
            --_clr-border: var(--clr-0);
        }

        .kbSegmentLabel {
            // internal variables 
            --_clr: var(--clr-900);
            --_clr-background: var(--clr-100);
            --_clr-highlight: var(--clr-150);
            --_clr-border: var(--clr-0);

            &:hover {
                --_clr: var(--clr-1000);
                --_clr-border: var(--clr-0);
            }
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    .keyboardControls {
        display: flex;
        flex-direction: column;
        gap: var(--pad-xs);
        position: sticky;
        top: calc(var(--reels-height) + $cassetteBottom-visible + var(--border-width-thick));
        height: 100%;

        padding: var(--pad-xs);
    }

    .input {
        flex-grow: 1;

        &:first-child .kbSegmentLabel {
            border-top-left-radius: calc($input-border-radius - var(--pad-xs));

            &::before {
                border-top-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
            }
        }

        &:last-child .kbSegmentLabel {
            border-bottom-left-radius: calc($input-border-radius - var(--pad-xs));

            &::before {
                border-bottom-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
            }
        }

        .kbSegmentRadio:focus-visible + .kbSegmentLabel {
            border-color: var(--clr-focus-red);
        }

        .kbSegmentRadio:checked + .kbSegmentLabel {
            &::after {
                border-color: #{map.get($light, 200)};
            }

            .indicator {
                background-color: var(--clr-500);

                &.populated {
                    background-color: map.get($dark, "red");
                }
            }
        }

        .kbSegmentLabel {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            position: relative;
            width: unset;
            height: 100%;

            white-space: nowrap;

            padding: 8px 10px;
            border-radius: var(--borderRadius-sm);
            margin: 0 var(--pad-xl) 0 0;

            &::before {
                border-radius: calc(var(--borderRadius-sm) - var(--border-width-thick));
            }

            &::after {
                // active light to the right
                content: "";
                position: absolute;
                top: 0;
                right: calc(-1 * var(--pad-md) - var(--border-width));
                bottom: 0;
                
                border-right: solid var(--border-width-thick) map.get($light, 700);

                transition: border-color var(--trans-fast) ease;
            }

            .indicator {
                width: 13px;
                height: 2px;
                background-color: map.get($light, 600);
                transition: background-color 0.1s ease;

                &.populated {
                    background-color: map.get($dark, "red");
                }
            }
        }
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
        .wrapper {
            flex-grow: 1;
        }

        .keyboardControls {
            flex-direction: column-reverse;
        }

        .input {
            &:first-child .kbSegmentLabel {
                border-top-left-radius: var(--borderRadius-sm);
                border-bottom-left-radius: calc($input-border-radius - var(--pad-xs));

                &::before {
                    border-top-left-radius: var(--borderRadius-sm);
                    border-bottom-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
                }
            }

            &:last-child .kbSegmentLabel {
                border-top-left-radius: calc($input-border-radius - var(--pad-xs));
                border-bottom-left-radius: var(--borderRadius-sm);

                &::before {
                    border-top-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
                    border-bottom-left-radius: var(--borderRadius-sm);
                }
            }

            .kbSegmentLabel {
                padding: 10px 8px;
            }
        }
        
    }

    @media (orientation: landscape) and (max-width: $breakpoint-tablet) {
        .wrapper {
            width: 100%;
        }
        
        .keyboardControls {
            flex-direction: row;

            .button {
                margin: 0 0 var(--pad-xl) 0;

                &::after {
                    // active line now at the bottom
                    top: unset;
                    right: 0;
                    bottom: calc(-1 * var(--pad-md) - var(--border-width));
                    left: 0;
                    
                    border-right: none;
                    border-bottom: solid var(--border-width-thick) map.get($light, 700);
                }

                &:active, &.active {
                    &::after {
                        border-color: #{map.get($light, 200)};
                    }
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