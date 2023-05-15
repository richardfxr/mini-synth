/* === IMPORTS ============================ */
// Svelte
import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';
// Tone
import type * as Tone from 'tone';

/* === STORES ============================= */
export const firstLoad = writable(true);
export const colorScheme: Writable<string> = writable();
export const displayedColorScheme: Writable<string> = writable();

// Tone
export const synth: Writable<Tone.PolySynth> | Writable<null> = writable(null);
export const players: Writable<Tone.Players> | Writable<null> = writable(null);
export const playersVol: Writable<Tone.Volume> | Writable<null> = writable(null);

/* === UPDATES ============================ */
colorScheme.subscribe((value) => {
    // update displayedColorScheme if colorScheme is manually set
    if (value === "light" || value === "dark") {
        displayedColorScheme.set(value);
    }
});

if (browser) {
    /* === INIT MEDIA QUERIES ================= */
    if (get(colorScheme) === "light" || get(colorScheme) === "dark") {
        displayedColorScheme.set(get(colorScheme));
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        displayedColorScheme.set("dark");
    } else {
        displayedColorScheme.set("light");
    }

    /* === MEDIA QUERY LISTENERS ============== */
    // prefers-color-scheme event listener
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        if (get(colorScheme) === "light" || get(colorScheme) === "dark") return;

        // set appropriate displayedColorScheme if user has not manually selected colorScheme
        e.matches ? displayedColorScheme.set("dark") : displayedColorScheme.set("light");
    });
}