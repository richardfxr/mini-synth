<script lang="ts">
    /* === IMPORTS ============================ */
    // icons
    import MenuIcon from "$lib/SVGs/menuIcon.svelte";

    /* === PROPS ============================== */
    export let title: string; // bind
    export let isReady: boolean;

    /* === VARIABLES ========================== */
    let titleInput: HTMLInputElement;
</script>



<header
    class="cassetteHeader"
    class:isReady>
    <a
        href="/"
        id="menu"
        class="button"
        style="--_dir: 1">
        <span class="visuallyHidden">menu</span>
        <MenuIcon />
    </a>

    <input
        type="text"
        autocomplete="off"
        placeholder="song title"
        disabled={!isReady}
        bind:this={titleInput}
        bind:value={title}>
    
    <button
        class="button"
        style="--_dir: -1"
        disabled>
    </button>
</header>



<style lang="scss">
    .cassetteHeader {
        display: flex;
        flex-flow: row nowrap;
        gap: var(--pad-xl);

        padding: 
            var(--pad-xl)
            var(--pad-xl)
            var(--pad-md)
            var(--pad-xl);
    }

    .button {
        flex-shrink: 0;

        transition: transform var(--trans-slow) var(--trans-cubic-1),
                    opacity var(--trans-slow) var(--trans-cubic-1);

        // load state
        transform: translateX(calc(var(--_dir) * 35px));
        opacity: 0;
    }

    input {
        flex-grow: 1;
        width: 100%;

        font-size: 1.1rem;
        text-align: center;
        
        border: none;
        border-bottom: solid var(--border-width) var(--clr-350);

        transition: border-color var(--trans-normal) ease,
                    opacity var(--trans-slow) var(--trans-cubic-1);

        // load state
        opacity: 0;
        
        &:focus {
            border-color: var(--clr-600);
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
</style>