/**
 * Roving focus for a row of buttons (ToggleGroup).
 *
 * Arrow keys move focus between the enabled items, Home and End jump to the first and last, and the
 * page does not scroll while they do. Blazor cannot cancel a key's default action per key, so the
 * movement lives here; what an item does when pressed stays in .NET.
 */

/** @type {WeakMap<HTMLElement, Function>} */
const handlers = new WeakMap();

/**
 * Starts arrow-key movement inside a group.
 * @param {HTMLElement} root - The group element.
 * @param {string} itemSelector - Selects the focusable items inside the group.
 */
export function attach(root, itemSelector) {
    if (!root || handlers.has(root)) {
        return;
    }

    const handler = (event) => {
        const items = [...root.querySelectorAll(itemSelector)].filter(i => !i.disabled);
        const index = items.indexOf(document.activeElement);
        if (index < 0) {
            return;
        }

        let next = -1;
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                next = (index + 1) % items.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                next = (index - 1 + items.length) % items.length;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = items.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        items[next].focus();
    };

    root.addEventListener('keydown', handler);
    handlers.set(root, handler);
}

/**
 * Stops arrow-key movement inside a group.
 * @param {HTMLElement} root - The group element.
 */
export function detach(root) {
    const handler = root ? handlers.get(root) : null;
    if (handler) {
        root.removeEventListener('keydown', handler);
        handlers.delete(root);
    }
}
