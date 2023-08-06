<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { createEventDispatcher } from 'svelte';
    // stores
    import { colorScheme, displayedColorScheme } from '../storage/store';
    // icons
    import SunIcon from '$lib/SVGs/sunIcon.svelte';
    import MoonIcon from '$lib/SVGs/moonIcon.svelte';
    import Logo from '$lib/SVGs/logo.svelte';
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';
    import TrashCanIcon from '$lib/SVGs/trashCanIcon.svelte';
    import DuplicateIcon from '$lib/SVGs/duplicateIcon.svelte';

    /* === PROPS ============================== */
    export let isReady: boolean;
    export let working: boolean;
    export let noSelectedSongs: boolean;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();

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
</script>



<header
    class="indexHeader"
    class:isReady
    class:hidden={!noSelectedSongs}>
    <button
        class="button"
        type="button"
        on:click={toggleColorScheme}>
        {#if $displayedColorScheme === "dark"}
            <span class="visuallyHidden">use light mode</span>
            <SunIcon />
        {:else}
            <span class="visuallyHidden">use dark mode</span>
            <MoonIcon />
        {/if}
    </button>

    <div class="logo">
        <Logo />
    </div>
</header>

<ul class="actions" class:isReady>
    <li id="new">
        <a
            href="/song/new"
            class="button">
            <span class="visuallyHidden">new song</span>
            <PlusIcon />
        </a>
    </li>
    <li id="duplicate">
        <button
            class="button"
            class:disabled={noSelectedSongs}
            disabled={noSelectedSongs || working}
            on:click={() => dispatch("duplicate")}>
            <span class="visuallyHidden">duplicate selected songs</span>
            <DuplicateIcon />
        </button>
    </li>
    <li id="delete">
        <button
            class="button warn"
            class:disabled={noSelectedSongs}
            disabled={noSelectedSongs || working}
            on:click={() => dispatch("delete")}>
            <span class="visuallyHidden">delete selected songs</span>
            <TrashCanIcon />
        </button>
    </li>
</ul>



<style lang="scss">
    /* === INTERNAL VARIABLES ================= */
    $_header-height: calc($button-minSize + 2 * $pad-2xl);
    
    /* === MAIN STYLES ======================== */
    .indexHeader {        
        display: grid;
        grid-template-columns: 1fr 40px 1fr;
        max-width: $page-maxWidth;

        padding: $pad-2xl;
        margin: 0 auto calc(-1 * $_header-height) auto;

        // load state
        transform: translateY(calc(-0.5 * $_header-height));
        opacity: 0;

        transition: transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;

        &.isReady {
            // default state
            transform: translateY(0);
            opacity: 1;
        }
    }

    .logo {
        display: flex;
        align-items: center;
    }

    .actions {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        gap: $pad-sm;
        position: sticky;
        top: 0;
        right: 0;
        max-width: $page-maxWidth;
        z-index: 1000;

        padding: $pad-2xl;
        margin: 0 auto;

        // allow click through
        pointer-events: none;

        // load state
        transform: translateY(calc(-0.5 * $_header-height));
        opacity: 0;

        transition: transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;

        #new {
            order: 1;

            .button {
                width: 90px;
                pointer-events: auto; 
            }
        }

        #duplicate, #delete {
            .button {
                opacity: 1;
                transform: translateY(0);

                transition: color $trans-fast ease,
                            background-color $trans-fast ease,
                            border-color $trans-fast ease,
                            opacity $trans-normal $trans-cubic-1,
                            transform $trans-normal $trans-cubic-1;

                pointer-events: auto;

                &.disabled {
                    opacity: 0;
                    transform: translateY(calc(-1 * $_header-height));

                    transition: opacity $trans-normal cubic-bezier(.7,0,.93,.67),
                                transform $trans-normal cubic-bezier(.7,0,.93,.67);
                }
            }
            
        }

        &.isReady {
            // default state
            transform: translateY(0);
            opacity: 1;
        }
    }

    /* === BREAKPOINTS ======================== */
    @media (max-width: 500px) {
        .indexHeader.hidden {
            opacity: 0;
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