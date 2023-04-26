<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    // types
    import type { TempId } from '../../../storage/db';
    // stores
    import { firstLoad } from "../../../storage/store";
    // components
    import Synth from "$lib/synth.svelte";

    /* === CONSTANTS ========================== */
    const slug = $page.params.slug;

    /* === VARIABLES ========================== */
    let id: TempId;

    if (!isNaN(Number(slug))) {
        id = Number(slug);
    } else if (slug === "new") {
        id = "new";
    } else {
        id = null;
    };

    /* === LIFECYCLES ========================= */
    onMount(() => {
        $firstLoad = false;
    });
</script>



<Synth {id} />