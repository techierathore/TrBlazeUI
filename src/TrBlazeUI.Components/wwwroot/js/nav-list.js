/**
 * NavList keyboard support (WAI-ARIA listbox / navigation-list patterns, flat).
 *
 * Same shape as tree-view.js and for the same reason: Blazor cannot cancel a key's default action
 * per key, so without this the arrows, Home, End and Space would scroll the page while the reader
 * is moving through the list. Movement lives here; what a row does when it is chosen stays in .NET
 * - Enter and Space simply click the focused row, so the component's own @onclick (select, or
 * follow the link) is the single code path for both mouse and keyboard.
 *
 * Every row renders, so document order is display order and no .NET round trip is needed to find
 * the neighbour.
 */

/** @type {WeakMap<HTMLElement, Function>} */
const handlers = new WeakMap();

const itemsOf = (root) => [...root.querySelectorAll('[data-slot=nav-list-option]')]
    .filter(i => i.getAttribute('aria-disabled') !== 'true');

/**
 * Starts keyboard handling for a list.
 * @param {HTMLElement} root - The element with role="listbox", or the <nav>.
 * @param {string} orientation - "horizontal" to move with Left and Right, anything else Up and Down.
 */
export function attach(root, orientation) {
    if (!root || handlers.has(root)) {
        return;
    }

    const isHorizontal = orientation === 'horizontal';
    const previousKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    const handler = (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        const item = event.target.closest('[data-slot=nav-list-option]');
        if (!item || !root.contains(item) || event.target !== item) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            item.click();
            return;
        }

        const items = itemsOf(root);
        const index = items.indexOf(item);
        if (index < 0) {
            return;
        }

        let target = null;
        if (event.key === previousKey) {
            target = items[index - 1];
        } else if (event.key === nextKey) {
            target = items[index + 1];
        } else if (event.key === 'Home') {
            target = items[0];
        } else if (event.key === 'End') {
            target = items[items.length - 1];
        } else {
            return;
        }

        event.preventDefault();
        if (target && root.contains(target)) {
            target.focus();
        }
    };

    root.addEventListener('keydown', handler);
    handlers.set(root, handler);
}

/**
 * Stops keyboard handling for a list.
 * @param {HTMLElement} root - The element attach() was given.
 */
export function detach(root) {
    const handler = root ? handlers.get(root) : null;
    if (handler) {
        root.removeEventListener('keydown', handler);
        handlers.delete(root);
    }
}
