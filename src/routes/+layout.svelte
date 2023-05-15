<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    // Dexie
    import { db } from "../storage/db";
    // stores
    import { colorScheme, displayedColorScheme } from '../storage/store';

    /* === UPDATES ============================ */
    colorScheme.subscribe(async (value) => {
        if (!browser || !value) return;

        // set data-theme attribute on <html>
        document.documentElement.setAttribute('data-colorScheme', value);

        // update settings db
        await db.settings.put({
            id: "colorScheme",
            value: value
        });

        console.log("db colorScheme update to " + value);
    });

    /* === LIFECYCLES ========================= */
    onMount(async () => {
        // colorScheme setting
        const dbColorScheme = await db.settings.get("colorScheme");
        dbColorScheme ? colorScheme.set(dbColorScheme.value) : colorScheme.set("auto");
    });
</script>



<svelte:head>
    <meta name="theme-color" content={$displayedColorScheme === "light" ? "#eeeeee" : "#282828"} />
</svelte:head>

<slot></slot>



<style lang="scss">

</style>