<script lang="ts">
    /* === PROPS ============================== */
    export let title: string; // bind

    /* === VARIABLES ========================== */
    let titleInput: HTMLInputElement;
</script>



<header class="cassetteHeader">
    <button
        id="menu"
        class="button"
        style="--_dir: 1">
        M
    </button>

    <input
        type="text"
        autocomplete="off"
        placeholder="song title"
        bind:this={titleInput}
        bind:value={title}>
    
    <button
        class="button"
        style="--_dir: -1">
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

        animation: buttonLoad var(--trans-slow) cubic-bezier(0, .36, .34, 1) 1;
        animation-delay: var(--ani-delay-load);
        animation-fill-mode: backwards;
    }

    input {
        flex-grow: 1;
        width: 100%;

        font-size: 1.1rem;
        text-align: center;
        
        border: none;
        border-bottom: solid var(--border-width) var(--clr-350);

        transition: border-color var(--trans-normal) ease;
        animation: inputLoad var(--trans-slow) ease 1;
        animation-delay: var(--ani-delay-load);
        animation-fill-mode: backwards;

        &:focus {
            border-color: var(--clr-600);
        }
    }

    /* === ANIMATIONS ========================= */
    @keyframes buttonLoad {
        from {
            transform: translateX(calc(var(--_dir) * 35px));
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes inputLoad {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>