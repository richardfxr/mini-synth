/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
 
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
import { build, files, version } from '$service-worker';

// unique cache name
const CACHE = `cache-${version}`;

const ASSETS = [
    // pages
    "/",
    "/song/1",                // returned for all /song/*
    "/demo/marble-machine",   // returned for all /demo/*
    // assets
    ...build,                 // the app itself
    ...files                  // everything in `static`
];

sw.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    // @ts-ignore
    event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }
    // @ts-ignore
    event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
    // ignore POST requests etc
    // @ts-ignore
    if (event.request.method !== 'GET') return;
   
    async function respond() {
        // @ts-ignore
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);
        
        if (ASSETS.includes(url.pathname)) {
            // return pages, build, and files if cached
            return cache.match(url.pathname);
        } else if (url.pathname.startsWith('/song/')) {
            // return /song/1 for all /song/* requests
            return cache.match('/song/1');
        } else if (url.pathname.startsWith('/demo/')) {
            // return /demo/marble-machine for all /demo/* requests
            return cache.match('/demo/marble-machine');
        }
    
        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            // @ts-ignore
            const response = await fetch(event.request);
    
            if (response.status === 200) {
                // @ts-ignore
                cache.put(event.request, response.clone());
            }
    
            return response;
        } catch {
            // @ts-ignore
            return cache.match(event.request);
        }
    }
   
    // @ts-ignore
    event.respondWith(respond());
});