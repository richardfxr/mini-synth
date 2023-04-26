<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { page } from '$app/stores';
    // types
    import type { TempId } from '../../../storage/db';
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
</script>



<Synth {id} />