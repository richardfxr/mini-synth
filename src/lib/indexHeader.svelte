<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { createEventDispatcher } from 'svelte';
    // icons
    import PlusIcon from '$lib/SVGs/plusIcon.svelte';
    import TrashCanIcon from '$lib/SVGs/trashCanIcon.svelte';
    import DuplicateIcon from '$lib/SVGs/duplicateIcon.svelte';

    /* === PROPS ============================== */
    export let isReady: boolean;
    export let working: boolean;
    export let noSelectedSongs: boolean;

    /* === CONSTANTS ========================== */
    const dispatch = createEventDispatcher();
</script>



<div class="header">
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
</div>



<style lang="scss">
    .actions {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        gap: var(--pad-sm);
        position: sticky;
        top: 0;
        right: 0;
        z-index: 1000;
        max-width: $page-maxWidth;

        padding: var(--pad-2xl);
        margin: 0 auto;

        // allow click through
        pointer-events: none;

        // load state
        transform: translateY(calc(-0.5 * var(--_actions-height)));
        opacity: 0;

        transition: transform var(--trans-normal) ease-in-out,
                    opacity var(--trans-normal) ease-in-out;

        &.isReady {
            transform: translateY(0);
            opacity: 1;
        }

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

                transition: opacity var(--trans-normal) var(--trans-cubic-1),
                            transform var(--trans-normal) var(--trans-cubic-1);

                pointer-events: auto;

                &.disabled {
                    opacity: 0;
                    transform: translateY(calc(-1 * var(--_actions-height)));

                    transition: opacity var(--trans-normal) cubic-bezier(.7,0,.93,.67),
                                transform var(--trans-normal) cubic-bezier(.7,0,.93,.67);
                }
            }
            
        }
    }
</style>