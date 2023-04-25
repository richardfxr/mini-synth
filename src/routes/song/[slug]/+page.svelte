<script lang="ts">
    /* === IMPORTS ============================ */
    import { page } from '$app/stores';
    import Synth from "$lib/synth.svelte";
    import type { TempId } from '../../../storage/db';

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
    }   
</script>



<Synth {id} />