<script lang="ts">
    /* === IMPORTS ============================ */
    // icons
    import SearchIcon from '$lib/SVGs/searchIcon.svelte';
    import CancelIcon from '$lib/SVGs/cancelIcon.svelte';

    /* === PROPS ============================== */
    export let searchQuery: string; // bind
    export let isReady: boolean;

    /* === VARIABLES ========================== */
    let searchInput: HTMLInputElement;
</script>



<div class="searchBar" class:isReady>
    <form on:submit|preventDefault={() => searchInput.blur()}>
        <label for="search__input">
            <span class="visuallyHidden">search songs</span>
            <SearchIcon />
        </label>

        <input
            id="search__input"
            type="search"
            autocomplete="off"
            placeholder=""
            disabled={!isReady}
            bind:this={searchInput}
            bind:value={searchQuery}>

        <button
            class="button"
            type="reset"
            disabled={searchQuery === ""}
            on:click|preventDefault={() => searchQuery = ""}>
            <span class="visuallyHidden">reset search</span>
            <CancelIcon />
        </button>
    </form>
</div>



<style lang="scss">
    .searchBar {
        color: var(--clr-700);
        background-color: var(--clr-100);
        border-top: solid var(--border-width) var(--clr-150);
        border-bottom: solid var(--border-width) var(--clr-150);

        transition: color var(--trans-fast) ease,
                    background-color var(--trans-fast) ease;

        &:focus-within {
            color: var(--clr-900);
            background-color: var(--clr-0);

            .button {
                --_clr-background: var(--clr-0);
            }
        }
    }

    form {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: var(--pad-xl);
        max-width: $page-maxWidth;

        padding: 0 var(--pad-2xl);
        margin: 0 auto;
    }

    :global(.search.icon) {
        // load state
        opacity: 0;

        transition: opacity var(--trans-slow) var(--trans-cubic-1);
    }

    input {
        width: 100%;
        color: var(--clr-900);
        font-size: 1.3rem;
        font-weight: 500;
        line-height: 1em;

        padding: var(--pad-2xl) 0;

        transition: color var(--trans-fast) ease;

        &::placeholder {
            color: var(--clr-700);

            transition: color var(--trans-fast) ease;
        }

        &::-webkit-search-cancel-button {
            -webkit-appearance: none;
        }
    }

    .button {
        flex-shrink: 0;

        transition: background-color var(--trans-normal) ease,
                    border-color var(--trans-normal) ease,
                    opacity var(--trans-normal) ease;

        &:disabled {
            opacity: 0;
        }
    }

    .searchBar.isReady {
        :global(.search.icon) {
            // default state
            opacity: 1;
        }
    }
</style>