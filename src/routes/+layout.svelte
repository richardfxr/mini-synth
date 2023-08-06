<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { browser, dev } from '$app/environment';
    // Vercel
    import { inject } from '@vercel/analytics';
    // Dexie
    import { db } from "../storage/db";
    // stores
    import { colorScheme, displayedColorScheme } from '../storage/store';

    /* === ANALYTICS ========================== */
    inject({ mode: dev ? 'development' : 'production' });

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
    <meta name="theme-color" content={$displayedColorScheme === "light" ? "#f7f7f7" : "#1d1d1d"} />
</svelte:head>

<slot></slot>



<style lang="scss" global>
    // === USE ====================================
    @use '../styles/resets.scss';
    @use '../styles/typefaces.scss';
    @use '../styles/global';
</style>