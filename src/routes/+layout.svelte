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
    });

    /* === LIFECYCLES ========================= */
    onMount(async () => {
        // console log styling
        const note0 = "background-color: #fad94d; color: black";
        const note1 = "background-color: #ffb566; color: black";
        const note2 = "background-color: #ff9a85; color: black";
        const note3 = "background-color: #ff85a1; color: black";
        const note4 = "background-color: #f090f7; color: black";
        const note5 = "background-color: #d1a1ff; color: black";
        const note6 = "background-color: #b0b7ff; color: black";
        const note7 = "background-color: #9ec8ff; color: black";
        const note8 = "background-color: #7cd7f7; color: black";
        const note9 = "background-color: #85e6d3; color: black";
        const note10 = "background-color: #7fe3b1; color: black";
        const note11 = "background-color: #a4eb7a; color: black";
        // console logs
        console.log("");
        console.log("%c %cm%ci%cn%ci%c %cs%cy%cn%ct%ch%c ", note0, note1, note2, note3, note4, note5, note6, note7, note8, note9, note10, note11);
        console.log("v1.2.2");
        console.log("Source code available on GitHub:");
        console.log("https://github.com/richardfxr/mini-synth");
        console.log("");

        // colorScheme setting
        const dbColorScheme = await db.settings.get("colorScheme");
        dbColorScheme ? colorScheme.set(dbColorScheme.value) : colorScheme.set("auto");
        
        // persistent storage
        const storage = await db.settings.get("storage");
        if (storage === undefined && navigator.storage) {
            const isPersistent = await navigator.storage.persisted();
            if (isPersistent) {
                await db.settings.put({
                    id: "storage",
                    value: "persistent"
                });
            } else {
                let result = await navigator.storage.persist();
                await db.settings.put({
                    id: "storage",
                    value: result ? "persistent" : "notPersistent"
                });
            }
        }
    });
</script>



<svelte:head>
    <meta name="theme-color" content={$displayedColorScheme === "light" ? "#f7f7f7" : "#1d1d1d"} />
    <!-- open graph image -->
    <meta property="og:image" content="/og-image-1.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="A Mini Synth with a cassette logo." />
</svelte:head>

<slot></slot>



<style lang="scss" global>
    // === USE ====================================
    @use '../styles/resets.scss';
    @use '../styles/typefaces.scss';
    @use '../styles/global';
</style>