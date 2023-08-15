<svg
    class="logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 39 31">
    <rect class="black" width="39" height="31" rx="3" ry="3"/>
    <path class="note-11" d="m36,2h-4l-1,1v25l1,1h4c.55,0,1-.45,1-1V3c0-.55-.45-1-1-1Z"/>
    <path class="note-11-highlight" d="m36,2h-4l-1,1h5c.55,0,1,.45,1,1v-1c0-.55-.45-1-1-1Z"/>
    <polygon class="note-9" points="32 29 27 29 26 28 26 3 27 2 32 2 32 29"/>
    <polygon class="note-9-highlight" points="32 3 26 3 27 2 32 2 32 3"/>
    <polygon class="note-7" points="27 29 22 29 21 28 21 3 22 2 27 2 27 29"/>
    <polygon class="note-7-highlight" points="27 3 21 3 22 2 27 2 27 3"/>
    <polygon class="note-5" points="22 29 17 29 16 28 16 3 17 2 22 2 22 29"/>
    <polygon class="note-5-highlight" points="22 3 16 3 17 2 22 2 22 3"/>
    <polygon class="note-4" points="17 29 12 29 11 28 11 3 12 2 17 2 17 29"/>
    <polygon class="note-4-highlight" points="17 3 11 3 12 2 17 2 17 3"/>
    <polygon class="note-2" points="12 29 7 29 6 28 6 3 7 2 12 2 12 29"/>
    <polygon class="note-2-highlight" points="12 3 6 3 7 2 12 2 12 3"/>
    <path class="note-0" d="m7,2H3c-.55,0-1,.45-1,1v25c0,.55.45,1,1,1h4V2Z"/>
    <path class="note-0-highlight" d="m7,2H3c-.55,0-1,.45-1,1v1c0-.55.45-1,1-1h4v-1Z"/>
    <circle class="note-0-screw" cx="5" cy="5" r="1"/>
    <circle class="note-0-screw" cx="5" cy="26" r="1"/>
    <circle class="note-11-screw" cx="34" cy="5" r="1"/>
    <circle class="note-11-screw" cx="34" cy="26" r="1"/>
    <path class="note-11-highlight" d="m31,20.58c1.76-.77,3-2.53,3-4.58v-1h-3v5.58Z"/>
    <path class="note-9-highlight" d="m26,21h3c1.13,0,2.16-.39,3-1.02v-4.98h-6v6Z"/>
    <rect class="note-7-highlight" x="21" y="15" width="6" height="6"/>
    <rect class="note-5-highlight" x="16" y="15" width="6" height="6"/>
    <rect class="note-4-highlight" x="11" y="15" width="6" height="6"/>
    <path class="note-2-highlight" d="m6,18.97c.91,1.22,2.36,2.03,4,2.03h2v-6h-6v3.97Z"/>
    <path class="note-0-highlight" d="m7,15h-2v1c0,1.63.79,3.06,2,3.98v-4.98Z"/>
    <rect class="grey" x="10" y="11" width="19" height="8"/>
    <rect class="black" x="10" y="10" width="19" height="2"/>
    <rect class="black" x="10" y="18" width="19" height="2"/>
    <path class="black" d="m10,19h9.16c.54-1.23.84-2.58.84-4s-.3-2.77-.84-4h-9.16v8Z"/>
    <circle class="black" cx="10" cy="15" r="5"/>
    <circle class="white" cx="10" cy="15" r="3"/>
    <circle class="black" cx="29" cy="15" r="5"/>
    <circle class="white" cx="29" cy="15" r="3"/>
</svg>


<style lang="scss">
    .logo {
        width: 39px;

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

        .black {
            fill: #000000;
        }

        .grey {
            fill: #696763;
        }

        .white {
            fill: #f7f7f7;
        }
    }
</style>