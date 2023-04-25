/* === IMPORTS ============================ */
import Dexie, { type Table } from 'dexie';
import type * as Tone from 'tone';

/* === TYPES ============================== */
// song
export type TempId = number | null | "new";
export type TapeName = "melody" | "beats";
export type Melody = Tone.Unit.Frequency[][];
export type Beats = string[][];
export type Tape = Melody | Beats;
export interface Song {
    id?: number;
    title: string;
    melody: Melody;
    beats: Beats;
    bpm: number;
};

/* === CLASSES ============================ */
export class MiniSynthDexie extends Dexie {
    // typing
    songs!: Table<Song>;

    constructor() {
        super('MiniSynthEdu');
        this.version(1).stores({
            songs: '++id, title, melody, beats, bpm'
        });
    }
}

export const db = new MiniSynthDexie();