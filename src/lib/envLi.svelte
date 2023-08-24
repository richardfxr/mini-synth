<script lang="ts">
    /* === PROPS ============================== */
    export let id: string;
    export let enabled: boolean;
    export let first = false;
    export let last = false;
</script>



<li
    {id}
    class:enabled
    class:first
    class:last>
    <span>
        <slot />
    </span>
    <div class="indicator">
        <span class="visuallyHidden">{enabled ? "enabled." : "disabled."}</span>
    </div>
</li>



<style lang="scss">
    /* === INTERNAL VARIABLES ================= */
    $_indicator-size: 20px;
    $_indicator-highlight: 1px;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        li {
            --_clr-border: var(--clr-300);

            &.enabled {
                .indicator {
                    background-color: #ff7e7e;

                    &::before {
                        background-color: #ec4848;
                    }
                }
            }

            .indicator {
                background-color: var(--clr-100);

                &::before {
                    background-color: var(--clr-250);
                }
            }
        }
    }

    @mixin dark {
        li {
            --_clr-border: var(--clr-0);

            &.enabled {
                .indicator {
                    background-color: var(--clr-active-highlight);

                    &::before {
                        background-color: var(--clr-active);
                    }
                }
            }

            .indicator {
                background-color: var(--clr-150);

                &::before {
                    background-color: var(--clr-50);
                }
            }
        }
    }

    /* === MAIN STYLES ======================== */
    @include light;

    li {
        display: flex;
        flex-flow: row-reverse wrap;
        align-items: center;
        justify-content: flex-end;
        gap: $pad-lg;

        padding: $li-pad-vrt 0;
        border-bottom: solid $border-width var(--_clr-border);

        &.first {
            padding-top: 0;
        }

        &.last {
            padding-bottom: 0;
            border-bottom: none;
        }

        .indicator {
            position: relative;
            width: $_indicator-size;
            height: $_indicator-size;

            border: solid $border-width-thick var(--clr-cassette-border);
            border-radius: $borderRadius-round;

            &::before {
                // main color
                content: "";
                position: absolute;
                top: $_indicator-highlight;
                right: calc(0.5 * $_indicator-highlight);
                bottom: 0;
                left: calc(0.5 * $_indicator-highlight);

                border-radius: $borderRadius-round;
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
</style>