<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount, createEventDispatcher } from 'svelte';
    // stores
    import { colorScheme, displayedColorScheme } from '../storage/store';
    // icons
    import SunIcon from '$lib/SVGs/sunIcon.svelte';
    import MoonIcon from '$lib/SVGs/moonIcon.svelte';
    import Logo from '$lib/SVGs/logo.svelte';
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';
    import TrashCanIcon from '$lib/SVGs/trashCanIcon.svelte';
    import DuplicateIcon from '$lib/SVGs/duplicateIcon.svelte';
    import DownloadIcon from '$lib/SVGs/downloadIcon.svelte';
    import InfoIcon from '$lib/SVGs/infoIcon.svelte';

    /* === PROPS ============================== */
    export let isReady: boolean;
    export let working: boolean;
    export let selectedSongs: number[];

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

    /* === VARIABLES ========================== */
    let observer: IntersectionObserver;
    let darkMode = false;
    let actions: HTMLElement;
    let actionsIsSticking = false;

    /* === UPDATES ============================ */
    colorScheme.subscribe((value) => {
        if (darkMode && value === "light") {
            darkMode = false;
        } else if (!darkMode && value === "dark") {
            darkMode = true;
        }
    });

    /* === FUNCTIONS ========================== */
    function toggleColorScheme(): void {
        if ($colorScheme === "light") {
            $colorScheme = "dark";
        } else if ($colorScheme === "dark") {
            $colorScheme = "light";
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            $colorScheme = "light";
        } else {
            $colorScheme = "dark";
        }
    }

    /* === LIFE CYCLES ======================== */
    onMount(() => {
		observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting) {
                actionsIsSticking = true;
            } else {
                actionsIsSticking = false;
            }
        }, {
            rootMargin: "0px 0px -100%"
        });

        observer.observe(actions);
	});
</script>



<header
    class="indexHeader housing"
    class:isReady>
    <a href="#searchBar" id="skipToSongs">skip to songs</a>
    <div class="logoAndName">
        <Logo />
        <p>mini synth</p>
    </div>
    <a
        href="#"
        class="button">
        <span class="visuallyHidden">about</span>
        <InfoIcon />
    </a>
</header>

<setion
    class="actions housing"
    class:isReady
    class:isSticking={actionsIsSticking}
    aria-label="song options"
    bind:this={actions}>
    <ul class="scrollContainer">
        <li id="new">
            <a
                href="/song/new"
                class="button new">
                <span class="visuallyHidden">new song</span>
                <PlusIcon />
            </a>
        </li>
        <li id="duplicate">
            <button
                class="button"
                class:disabled={selectedSongs.length === 0}
                disabled={selectedSongs.length === 0 || working}
                on:click={() => dispatch("duplicate")}>
                <span class="visuallyHidden">
                    duplicate {selectedSongs.length} selected songs
                </span>
                <DuplicateIcon />
            </button>
        </li>
        <li id="delete">
            <button
                class="button warn"
                class:disabled={selectedSongs.length === 0}
                disabled={selectedSongs.length === 0 || working}
                on:click={() => dispatch("delete")}>
                <span class="visuallyHidden">
                    delete {selectedSongs.length} selected songs
                </span>
                <TrashCanIcon />
            </button>
        </li>
        <li>
            <input
                id="colorMode"
                class="buttonInput visuallyHidden"
                type="checkbox"
                bind:checked={darkMode}
                on:input={toggleColorScheme}>
            <label
                class="button"
                for="colorMode">
                <span class="visuallyHidden">dark mode</span>
                {#if $displayedColorScheme === "dark"}
                    <SunIcon />
                {:else}
                    <MoonIcon />
                {/if}
            </label>
        </li>
        <li id="delete">
            <button
                id="install"
                class="button"
                on:click={() => dispatch("delete")}>
                <span class="visuallyHidden">install mini synth</span>
                <DownloadIcon />
            </button>
        </li>
    </ul>
</setion>



<style lang="scss">
    /* === INTERNAL VARIABLES ================= */
    $_header-height: calc($button-minSize + 2 * $pad-2xl);
    $_pad-hrz: 25px;
    $_houaing-pad-bottom: 15px;
    $_button-size: 60px;
    $_button-circle-inset: 7px;

    /* === COLOR SCHEME MIXINS ================ */
    @mixin light {
        .actions {
            &.isSticking::after {
                opacity: 0.35;
            }

            .scrollContainer .button {
                &, &.warn {
                    &:hover, &:focus {
                        --_clr-background: var(--clr-50);
                    }

                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-400);
                        --_clr-background: var(--clr-150);
                        --_clr-highlight: var(--clr-150);
                    }
                }

                &.warn {
                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-red-disabled);
                    }
                }

                &.new {
                    --_clr: var(--clr-50);
                    --_clr-background: #ec4848;
                    --_clr-highlight: #ff7e7e;

                    &:hover, &:focus {
                        --_clr: var(--clr-0);
                        --_clr-background: #e23737;
                        --_clr-highlight: #ff6e6e;
                    }

                    &:focus-visible {
                        outline-color: var(--clr-0);
                    }

                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-red-disabled);
                    }
                }
            }
        } 
    }

    @mixin dark {
        .actions {
            &.isSticking::after {
                opacity: 1;
            }

            .scrollContainer .button {
                &, &.warn {
                    &:hover, &:focus {
                        --_clr-background: var(--clr-150);
                    }

                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-400);
                        --_clr-background: var(--clr-75);
                        --_clr-highlight: var(--clr-75);
                    }
                }

                &.warn {
                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-red-disabled);
                    }
                }

                &.new {
                    --_clr: var(--clr-900);
                    --_clr-background: #cf2a2a;
                    --_clr-highlight: #f14d4d;

                    &:hover, &:focus {
                        --_clr: var(--clr-1000);
                        --_clr-background: #c02222;
                        --_clr-highlight: #ed4545;
                    }

                    &:focus-visible {
                        outline-color: var(--clr-1000);
                    }

                    &:disabled, &.kbActive:disabled {
                        --_clr: var(--clr-red-disabled);
                    }
                }
            }
        } 
    }
    
    /* === MAIN STYLES ======================== */
    @include light;

    .housing {
        position: relative;
        max-width: $cassette-maxWidth;

        padding: 0 $pad-2xl;
        background-color: var(--clr-cassette-bg-shadow);
        border: solid $border-width-thick var(--clr-cassette-border);
        border-top: none;
        margin: 0 auto;

        &::before {
            // main color
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            z-index: -1;

            background-color: var(--clr-cassette-bg);
            border-right: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
            border-left: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
            
            transition: background-color $trans-fast ease,
                        border-color $trans-fast ease;
        }
    }

    .indexHeader {
        display: flex;
        flex-flow: row wrap;
        position: relative;
        justify-content: space-between;
        z-index: 1001;

        padding: $pad-xl $_pad-hrz;

        // load state
        transform: translateY(calc(-0.5 * $_header-height));
        opacity: 0;

        transition: background-color $trans-fast ease,
                    border-color $trans-fast ease,
                    transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;

        &::before {
            // main color
            bottom: $cassette-shading-size;
        }

        &.isReady {
            // default state
            transform: translateY(0);
            opacity: 1;
        }

        #skipToSongs {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: $cassette-shading-size;
            right: $border-width-thick;
            bottom: $cassette-shading-size;
            left: $border-width-thick;
            z-index: -2;

            color: var(--clr-900);
            font-size: 1.1rem;
            font-weight: 500;
            background-color: var(--clr-100);
            outline: solid $border-width-thick transparent;
            outline-offset: -2px;

            transition: outline-color $trans-fast ease;

            &:focus-visible {
                z-index: 2;
                outline-color: var(--clr-focus-red);
            }
        }

        .logoAndName {
            display: flex;
            align-items: center;
            gap: $pad-xl;

            p {
                color: var(--clr-900);
                font-size: 1.1rem;
                font-weight: 600;

                transition: color $trans-fast ease;
            }
        }
    }

    .actions {
        display: flex;
        justify-content: center;
        position: sticky;
        top: 0;
        right: 0;
        z-index: 1000;

        padding: 0 $_pad-hrz;
        border-radius:
            0
            0
            $cassette-border-radius
            $cassette-border-radius;
        margin-bottom: $pad-md;

        // load state
        transform: translateY(calc(-0.5 * $_header-height));
        opacity: 0;

        transition: background-color $trans-fast ease,
                    border-color $trans-fast ease,
                    transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;
        
        &::before {
            // main color
            bottom: $_houaing-pad-bottom;
            border-radius:
                0
                0
                calc($cassette-border-radius - $border-width)
                calc($cassette-border-radius - $border-width);
        }

        &::after {
            // drop shadow
            content: "";
            position: absolute;
            top: 0;
            right: -$border-width-thick;
            bottom: -$border-width-thick;
            left: -$border-width-thick;
            z-index: -2;

            border-radius:
                0
                0
                $cassette-border-radius
                $cassette-border-radius;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.55);

            opacity: 0;

            transition: opacity $trans-normal ease-in-out;
        }
        
        &.isReady {
            // default state
            transform: translateY(0);
            opacity: 1;
        }

        .scrollContainer {
            display: flex;
            flex-flow: row nowrap;

            border-right: solid $border-width-thick var(--clr-cassette-border);
            border-left: solid $border-width-thick var(--clr-cassette-border);
            margin: -$border-width-thick 0;

            transition: border-color $trans-fast ease;

            overflow-x: auto;

            .button {
                width: $_button-size;
                height: $_button-size;
                border-radius: $borderRadius-sm;
                border-color: var(--clr-cassette-border);
                margin-left: -$border-width-thick;

                &::before {
                    // main color
                    top: $border-width-thick;
                    right: 0;
                    left: 0;
                    border-radius: calc($borderRadius-sm - $border-width-thick);
                }

                &:focus-visible {
                    outline: solid $border-width-thick var(--clr-focus-red);
                    outline-offset: -7px;
                }
            }

            .buttonInput:focus-visible + .button {
                outline: solid $border-width-thick var(--clr-focus-red);
                outline-offset: -7px;
            }

            li:last-child .button {
                border-right: none;
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
    @media (max-width: calc($cassette-maxWidth + 2 * $pad-xl)) {
        .housing {
            margin-right: $pad-xl;
            margin-left: $pad-xl;
        }
    }

    /* === A11Y =============================== */
    @media (prefers-reduced-motion: reduce) {
        .indexHeader, .actions {
            // load state
            transform: translateY(0);
        }
    }
</style>