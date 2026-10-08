/**
 * Element utilities for common DOM operations
 * Provides reusable functions to replace eval() calls
 */

/**
 * Shows an element by setting opacity and pointer-events.
 * Used as fallback when positioning setup fails.
 * @param {string} elementId - The ID of the element to show
 */
export function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
}

/**
 * Places a floating element directly under its anchor and shows it. The fallback FloatingPortal
 * uses when the positioning library fails (Sevak TR-041): before it, a failed computePosition left
 * the list parked at -9999px, so the user saw nothing happen. Returns the coordinates applied so
 * the component can keep them across re-renders.
 * @param {HTMLElement} anchor - The element the floating content belongs to
 * @param {HTMLElement} floating - The floating content
 * @param {number} offset - Gap in pixels between the two
 * @returns {{x: number, y: number}|null} The applied position, or null when either element is gone
 */
export function placeUnderAnchor(anchor, floating, offset = 4) {
    if (!anchor || !floating || !document.body.contains(anchor) || !document.body.contains(floating)) {
        return null;
    }
    const rect = anchor.getBoundingClientRect();
    const x = Math.max(0, rect.left);
    const y = rect.bottom + offset;
    floating.style.position = 'fixed';
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
    floating.style.visibility = 'visible';
    floating.style.opacity = '1';
    floating.style.pointerEvents = 'auto';
    return { x, y };
}

/**
 * Scrolls an element into view with configurable options.
 * @param {string} elementId - The ID of the element to scroll into view
 * @param {string} block - The block alignment ('nearest', 'start', 'center', 'end')
 * @param {string} behavior - The scroll behavior ('instant', 'smooth', 'auto')
 */
export function scrollIntoView(elementId, block = 'nearest', behavior = 'instant') {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            block: block,
            behavior: behavior
        });
    }
}

/**
 * Focuses an element by its ID.
 * @param {string} elementId - The ID of the element to focus
 */
export function focusElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.focus();
    }
}
