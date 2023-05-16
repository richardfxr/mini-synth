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
    // === USE ====================================
    @use "sass:map";
    @use '../styles/colors' as *;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .button {
            // internal variables 
            --_clr: var(--clr-100);
            --_clr-background: var(--clr-800);
            --_clr-highlight: var(--clr-700);
            --_clr-border: var(--clr-1000);

            &:hover {
                --_clr: var(--clr-0);
                --_clr-border: var(--clr-1000);
            }

            &:active, &.active {
                --_clr: var(--clr-0);
                --_clr-background: var(--clr-700);
                --_clr-highlight: var(--clr-800);
                --_clr-border: var(--clr-1000);
            }
        }
    }

    @mixin dark {
        .button {
            // internal variables 
            --_clr: var(--clr-900);
            --_clr-background: var(--clr-100);
            --_clr-highlight: var(--clr-150);
            --_clr-border: var(--clr-0);

            &:hover {
                --_clr: var(--clr-1000);
                --_clr-border: var(--clr-0);
            }

            &:active, &.active {
                --_clr: var(--clr-1000);
                --_clr-background: var(--clr-150);
                --_clr-highlight: var(--clr-50);
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

    .button {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        position: relative;
        width: unset;
        height: unset;

        white-space: nowrap;

        padding: 8px 10px;
        border-radius: var(--borderRadius-sm);
        margin: 0 var(--pad-xl) 0 0;

        &:active, &.active{
            &::after {
                border-color: #{map.get($light, 200)};
            }

            .indicator {
                background-color: var(--clr-500);
            }
        }

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

        &:first-child {
            border-top-left-radius: calc($input-border-radius - var(--pad-xs));

            &::before {
                border-top-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
            }
        }

        &:last-child {
            border-bottom-left-radius: calc($input-border-radius - var(--pad-xs));

            &::before {
                border-bottom-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
            }
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

        .button {
            padding: 10px 8px;

            &:first-child {
                border-top-left-radius: var(--borderRadius-sm);
                border-bottom-left-radius: calc($input-border-radius - var(--pad-xs));

                &::before {
                    border-top-left-radius: var(--borderRadius-sm);
                    border-bottom-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
                }
            }

            &:last-child {
                border-top-left-radius: calc($input-border-radius - var(--pad-xs));
                border-bottom-left-radius: var(--borderRadius-sm);

                &::before {
                    border-top-left-radius: calc($input-border-radius - var(--border-width-thick) - var(--pad-xs));
                    border-bottom-left-radius: var(--borderRadius-sm);
                }
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