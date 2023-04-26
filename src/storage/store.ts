/* === IMPORTS ============================ */
// Svelte
import { writable, get, type Writable } from 'svelte/store';
// Tone
import type * as Tone from 'tone';

/* === STORES ============================= */
export const firstLoad = writable(true);

// Tone
export const synth: Writable<Tone.PolySynth> | Writable<null> = writable(null);
export const players: Writable<Tone.Players> | Writable<null> = writable(null);
export const playersVol: Writable<Tone.Volume> | Writable<null> = writable(null);