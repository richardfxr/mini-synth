<script lang="ts">
    /* === IMPORTS ============================ */
    // Svelte
    import { onMount } from 'svelte';
    import { beforeNavigate } from '$app/navigation';
    import { fade } from 'svelte/transition';
    // stores
    import {
        firstLoad,
        PWAInstallEvent,
        synth
    } from "../../storage/store";
    // components
    import InfoIcon from "$lib/SVGs/infoIcon.svelte";
    import CancelIcon from "$lib/SVGs/cancelIcon.svelte";
    import EnvLi from '$lib/envLi.svelte';
    import Footer from '$lib/footer.svelte';

    /* === VARIABLES ========================== */
    let isReady = false;

    /* === LIFE CYCLES ======================== */
    onMount(() => {
        // time intro 
        if ($firstLoad) {
            isReady = true;
        } else {
            $firstLoad = false;
            setTimeout(() => {
                isReady = true;
            }, 225);
        }
	});

    beforeNavigate(() => {
        // unready on naviagation
        isReady = false;
    });
</script>



<div
    class="infoPage"
    class:isReady
    in:fade={{ duration: 50, delay: 200 }}
    out:fade={{ duration: 200 }}>
    <header class="housing">
        <h1>
            <InfoIcon />
            <span>info</span>
        </h1>
        <a
            href="/"
            class="button">
            <span class="visuallyHidden">back to home page</span>
            <CancelIcon />
        </a>
    </header>
    
    <section class="housing">
        <h2><span>About</span></h2>
        <p>Mini Synth is an educational project created by Ashley Fan, Richard Fu, and Sean Lee to introduce refugees to music. It serves as a simplified synthesizer that refugees utilize as they learn basic music theory.</p>
        <div class="h3Wrapper">
            <h3><span>Team</span></h3>
        </div>
        <ul class="buttonsList">
            <li>
                <a
                    class="button"
                    href="https://www.fanashley.com/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Ashley Fan
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://www.richardfxr.com/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Richard Fu
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://www.seansworkroom.com/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Sean Lee
                </a>
            </li>
        </ul>
        <div class="h3Wrapper">
            <h3><span>Instructors</span></h3>
        </div>
        <ul class="buttonsList">
            <li>
                <a
                    class="button"
                    href="https://heewon.mit.edu/home"
                    target="_blank"
                    rel="noopener noreferrer">
                    Heewon Lee
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://www.risd.edu/academics/industrial-design/faculty/sally-beiruti"
                    target="_blank"
                    rel="noopener noreferrer">
                    Sally Beiruti
                </a>
            </li>
            <li>
                <span class="text">
                    Adroa Patrick Lumumba
                </span>
            </li>
        </ul>
    </section>

    <section class="housing">
        <h2><span>Demos</span></h2>
        <ul class="buttonsList">
            <li>
                <a
                    class="button"
                    href="/demo/marble-machine">
                    Marble Machine - Wintergatan
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="/demo/save-your-tears">
                    Save Your Tears - The Weeknd
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="/demo/we-will-rock-you">
                    We Will Rock You - Queen
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="/demo/twinkle-twinkle">
                    Twinkle, Twinkle, Little Star
                </a>
            </li>
        </ul>
    </section>

    <section class="housing">
        <h2><span>Sponsors</span></h2>
        <ul class="buttonsList">
            <li>
                <a
                    class="button"
                    href="https://www.samsung.com/us/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Samsung
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://www.internationaldisabilityalliance.org/stakeholder/korea-international-cooperation-agency-koica"
                    target="_blank"
                    rel="noopener noreferrer">
                    Korea International Cooperation Agency (KOIKA)
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://community.needslist.co/ysat"
                    target="_blank"
                    rel="noopener noreferrer">
                    Youth Social Advocacy Team (YSAT)
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://www.risd.edu/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Rhode Island School of Design (RISD)
                </a>
            </li>
            <li>
                <a
                    class="button"
                    href="https://d-lab.mit.edu/"
                    target="_blank"
                    rel="noopener noreferrer">
                    MIT D-Lab
                </a>
            </li>
        </ul>
    </section>

    <section id="env" class="housing">
        <h2><span>Enviroment</span></h2>
        <ul>
            <EnvLi
                id="polysynth"
                enabled={$synth !== null}
                first>
                Tone.js PolySynth
            </EnvLi>
            <EnvLi
                id="pwaEnabled"
                enabled={true}>
                Progressive Web App
            </EnvLi>
            <EnvLi
                id="pwaDisabled"
                enabled={false}>
                Progressive Web App
            </EnvLi>
            <EnvLi
                id="pwaInstall"
                enabled={$PWAInstallEvent !== null}>
                PWA install prompt
            </EnvLi>
            <EnvLi
                id="fullscreen"
                enabled={document.fullscreenEnabled}
                last>
                Fullscreen support
            </EnvLi>
        </ul>
    </section>

    <Footer />
</div>




<style lang="scss">
    /* === INTERNAL VARIABLES ================= */
    $_header-height: calc($button-minSize + 2 * $pad-2xl);
    $_pad-hrz: 25px;

    /* === MAIN STYLES ======================== */
    .infoPage {
        &.isReady {
            header, section {
                // default state
                transform: translateY(0);
                opacity: 1;
            }
        }
    }

    header {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;

        padding:
            $pad-xl
            $_pad-hrz
            $pad-xl
            calc($_pad-hrz + $cassette-shading-size);
        border-top: none;
        border-radius:
            0
            0
            $cassette-border-radius
            $cassette-border-radius;

        // load state
        transform: translateY(calc(-0.5 * $_header-height));
        opacity: 0;

        transition: background-color $trans-fast ease,
                    border-color $trans-fast ease,
                    transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;

        &::before {
            // main color
            bottom: $cassette-shading-size;

            border-radius:
                0
                0
                calc($cassette-border-radius - $border-width)
                calc($cassette-border-radius - $border-width);
        }

        h1 {
            display: flex;
            gap: $pad-lg;
            position: relative;

            span {
                color: var(--clr-900);
                font-size: 1.1rem;
                font-weight: 600;

                transition: color $trans-fast ease;
            }
        }
    }

    section {
        display: flex;
        gap: $pad-3xl;
        flex-flow: column nowrap;
        z-index: 0;

        padding: $pad-3xl 0 $pad-4xl 0;
        border-radius: $cassette-border-radius;
        margin-top: $pad-xl;

        // load state
        transform: translateY(calc(0.5 * $_header-height));
        opacity: 0;

        transition: background-color $trans-fast ease,
                    border-color $trans-fast ease,
                    transform $trans-normal ease-in-out,
                    opacity $trans-normal ease-in-out;

        &::before {
            // main color
            bottom: $cassette-shading-size;

            border-top: solid $cassette-shading-size var(--clr-cassette-bg-highlight);
            border-radius: calc($cassette-border-radius - $border-width);
        }

        & > * {
            padding: 0 $_pad-hrz;
        }

        h2, h3 {
            position: relative;
            z-index: 1;

            color: var(--clr-0);
            font-size: 1.1rem;
            line-height: 1;
            text-transform: uppercase;

            span {
                font-weight: 700;
                padding: 0 $pad-md;
                background-color: var(--clr-900);
            }
        }

        .h3Wrapper {
            position: relative;
            padding: 0;
            border-top: solid $cassette-shading-size var(--clr-cassette-bg-shadow);

            h3 {
                padding: $pad_3xl $_pad-hrz 0 $_pad-hrz;
                border-top: solid $border-width-thick var(--clr-cassette-border);
            } 
        }

        p {
            color: var(--clr-900);
            font-size: 1rem;
            font-weight: 500;
            line-height: 1.6em;
        }

        .buttonsList {
            display: flex;
            flex-flow: column nowrap;
            gap: $pad-xs;

            padding: 0 $pad-md;
            
            li {
                &:first-child .text {
                    padding-top: 0;
                }

                &:last-child .text {
                    padding-bottom: 0;
                }

                .button {
                    justify-content: flex-start;
                    width: unset;
                    height: unset;

                    line-height: 1.2em;
                    padding: $li-pad-vrt calc($_pad-hrz - $border-width-thick - $pad-md);
                    border-radius: $borderRadius-sm;

                    &::before {
                        // main color
                        border-radius: calc($borderRadius-sm - $border-width-thick);
                    }
                }

                .text {
                    display: block;
                    padding: $li-pad-vrt calc($_pad-hrz - $pad-md);
                }
            } 
        } 
    }

    :global(#pwaEnabled) {
        display: none;
    }

    :global(#pwaDisabled) {
        display: flex;
    }

    /* === PROGRESSIVE WEB APP ================ */
    @media (display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui) {
        :global(#pwaEnabled) {
            display: flex;
        }

        :global(#pwaDisabled) {
            display: none;
        }
    }
</style>