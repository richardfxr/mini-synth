export function stopPropagation(e: KeyboardEvent, keyCodes: string[]): void {
    if (keyCodes.includes(e.code)) e.stopPropagation();
}