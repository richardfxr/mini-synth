<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    // helpers
    import { stopPropagation } from '$lib/helpers';
    // icons
    import MenuIcon from "$lib/SVGs/menuIcon.svelte";
    import ExitFullscreen from '$lib/SVGs/exitFullscreen.svelte';
    import EnterFullscreenIcon from '$lib/SVGs/enterFullscreenIcon.svelte';

    /* === PROPS ============================== */
    export let title: string; // bind
    export let isReady: boolean;

    /* === VARIABLES ========================== */
    let titleInput: HTMLInputElement;
    let allowFullscreen = false;
    let isFullscreen = false;

    /* === FUNCTIONS ========================== */
    function checkFullscreen(): void {
        // @ts-ignore
        isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    function toggleFullscreen(): void {
        if (!allowFullscreen) return;

        // check if document is currently full screen
        if (isFullscreen) {
            // get supported exitFullScreen
            // @ts-ignore
            let cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
            cancelFullScreen.call(document);
            isFullscreen = false;
        } else {
            // get supported requestFullScreen
            // @ts-ignore
            let requestFullScreen = document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullScreen || document.documentElement.msRequestFullscreen;
            requestFullScreen.call(document.documentElement);
            isFullscreen = true;
        }
    }

    /* === LIFECYCLES ========================= */
    onMount(() => {
        // check if full screen is allowed
        allowFullscreen = document.fullscreenEnabled;
        checkFullscreen();
    });
</script>



<svelte:window on:resize={checkFullscreen} />

<header
    class="cassetteHeader"
    class:isReady>
    <a
        href="/"
        id="menuButton"
        class="button"
        style="--_dir: 1"
        on:keydown={e => stopPropagation(e, ['Space'])}>
        <span class="visuallyHidden">menu</span>
        <MenuIcon />
    </a>

    <form on:submit|preventDefault={() => titleInput.blur()}>
        <h1>
            <input
                type="text"
                autocomplete="off"
                placeholder="song title"
                disabled={!isReady}
                bind:this={titleInput}
                bind:value={title}>
        </h1>
    </form>
    
    <button
        class="button"
        style="--_dir: -1"
        type="button"
        on:click={toggleFullscreen}
        disabled={!allowFullscreen}
        on:keydown={e => stopPropagation(e, ['Space'])}>
        {#if isFullscreen}
            <span class="visuallyHidden">exit fullscreen</span>
            <ExitFullscreen />
        {:else}
            <span class="visuallyHidden">enter fullscreen</span>
            <EnterFullscreenIcon />
        {/if}
    </button>
</header>



<style lang="scss">
    .cassetteHeader {
        display: flex;
        flex-flow: row nowrap;
        gap: $pad-xl;
        position: relative;

        padding: 
            $pad-xl
            $pad-xl
            $pad-md
            $pad-xl;
    }

    .button {
        flex-shrink: 0;

        transition: color $trans-fast ease,
                    background-color $trans-fast ease,
                    border-color $trans-fast ease,
                    transform $trans-slow $trans-cubic-1,
                    opacity $trans-slow $trans-cubic-1;

        // load state
        transform: translateX(calc(var(--_dir) * 35px));
        opacity: 0;
    }

    form {
        flex-grow: 1;

        h1 {
            height: 100%;
        }

        input {
            width: 100%;
            height: 100%;

            font-size: 1.1rem;
            text-align: center;
            
            border: none;
            border-bottom: solid $border-width var(--clr-350);

            transition: border-color $trans-normal ease,
                        opacity $trans-slow $trans-cubic-1;

            // load state
            opacity: 0;
            
            &:focus {
                border-color: var(--clr-600);
            }
        }
    }
    

    .cassetteHeader.isReady {
        .button {
            // default state
            transform: translateX(0);
            opacity: 1;
        }

        input {
            // default state
            opacity: 1;
        }
    }

    /* === A11Y =============================== */
    @media (prefers-reduced-motion: reduce) {
        .button {
            // load state
            transform: translateX(0);
        }
    }
</style>