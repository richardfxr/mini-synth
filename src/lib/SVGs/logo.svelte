<svg
    class="logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 16">
    <rect class="note-text" width="20" height="16" rx="1.5" ry="1.5"/>
    <path class="note-0" d="m1.5,1h2.07v14H1.5c-.28,0-.5-.22-.5-.5V1.5c0-.28.22-.5.5-.5Z"/>
    <rect class="note-2" x="3.57" y="1" width="2.57" height="14"/>
    <rect class="note-4" x="6.14" y="1" width="2.57" height="14"/>
    <rect class="note-5" x="8.71" y="1" width="2.57" height="14"/>
    <rect class="note-7" x="11.29" y="1" width="2.57" height="14"/>
    <rect class="note-9" x="13.86" y="1" width="2.57" height="14"/>
    <path class="note-11" d="m16.43,1h2.07c.28,0,.5.22.5.5v13c0,.28-.22.5-.5.5h-2.07V1h0Z"/>
    <path class="note-0-highlight" d="m1.5,1c-.28,0-.5.22-.5.5v.5c0-.28.22-.5.5-.5h2.07v-.5H1.5Z"/>
    <rect class="note-2-highlight" x="3.57" y="1" width="2.57" height=".5"/>
    <rect class="note-4-highlight" x="6.14" y="1" width="2.57" height=".5"/>
    <rect class="note-5-highlight" x="8.71" y="1" width="2.57" height=".5"/>
    <rect class="note-7-highlight" x="11.29" y="1" width="2.57" height=".5"/>
    <rect class="note-9-highlight" x="13.86" y="1" width="2.57" height=".5"/>
    <path class="note-11-highlight" d="m18.5,1h-2.07v.5h2.07c.28,0,.5.22.5.5v-.5c0-.28-.22-.5-.5-.5Z"/>
    <circle class="cls-16" cx="2.5" cy="2.5" r=".5"/>
    <circle class="cls-16" cx="2.5" cy="13.5" r=".5"/>
    <circle class="cls-11" cx="17.5" cy="2.5" r=".5"/>
    <circle class="cls-11" cx="17.5" cy="13.5" r=".5"/>
    <path class="note-text" d="m5,6c1.1,0,2,.9,2,2s-.9,2-2,2-2-.9-2-2,.9-2,2-2m0-1c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3h0Z"/>
    <path class="note-text" d="m15,6c1.1,0,2,.9,2,2s-.9,2-2,2-2-.9-2-2,.9-2,2-2m0-1c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3h0Z"/>
    <polygon class="note-text" points="15 5 5 5 5 6 15 6 15 5 15 5"/>
    <polygon class="note-text" points="15 10 5 10 5 11 15 11 15 10 15 10"/>
</svg>



<style lang="scss">
    .logo {
        // colors
        @for $i from 0 through 11 {
            .note-#{$i} {
                fill: var(--clr-note-#{$i});
            }

            .note-#{$i}-highlight {
                fill: var(--clr-note-#{$i}-highlight);
            }
        }

        .note-0-screw {
            fill: #d9b41a;
        }

        .note-11-screw {
            fill: #73cc3e;
        }

        .note-text {
            fill: var(--clr-note-text);
        }
    }
</style>