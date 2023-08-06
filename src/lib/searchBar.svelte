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
        background-color: var(--clr-50);
        border-top: solid $border-width var(--clr-border);
        border-bottom: solid $border-width var(--clr-border);

        transition: color $trans-fast ease,
                    background-color $trans-fast ease,
                    border-color $trans-fast ease;

        &:focus-within {
            color: var(--clr-900);
            background-color: var(--clr-highlight);

            .button {
                --_clr-background: var(--clr-highlight);
            }
        }
    }

    form {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: $pad-xl;
        max-width: $page-maxWidth;

        padding: 0 $pad-2xl;
        margin: 0 auto;
    }

    :global(.search.icon) {
        // load state
        opacity: 0;

        transition: opacity $trans-slow $trans-cubic-1;
    }

    input {
        width: 100%;
        color: var(--clr-900);
        font-size: 1.3rem;
        font-weight: 500;
        line-height: 1em;

        padding: $pad-2xl 0;

        transition: color $trans-fast ease;

        &::placeholder {
            color: var(--clr-700);

            transition: color $trans-fast ease;
        }

        &::-webkit-search-cancel-button {
            -webkit-appearance: none;
        }
    }

    .button {
        flex-shrink: 0;

        transition: background-color $trans-normal ease,
                    border-color $trans-normal ease,
                    opacity $trans-normal ease;

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