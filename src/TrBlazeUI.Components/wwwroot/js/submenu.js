/**
 * Submenu placement for MenubarSubContent, DropdownMenuSubContent and ContextMenuSubContent
 * (Chatur TR-020, TR-024). A submenu opens to the right of its trigger row; when that would run
 * past the right edge of the window it opens to the left instead; when neither side has room it
 * keeps the side with more room and is pulled back so it stays inside the window, over part of
 * its parent list.
 */

/** The least distance kept between a pulled-back list and the window's edge, in CSS pixels. */
const MARGIN = 8;

/**
 * Tells where a submenu fits.
 * @param {HTMLElement} element - The submenu list, drawn on the right
 * @returns {{side: string, offset: number, maxWidth: number}} The side ("right" or "left"); how far
 *   the list is pulled back toward its row so its far edge stays inside the window, 0 when it fits
 *   where it is drawn; and a width cap when the list is wider than the window, else 0
 */
export function fit(element) {
    const fitsOnRight = { side: 'right', offset: 0, maxWidth: 0 };
    if (!element || !element.isConnected) return fitsOnRight;
    const rect = element.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth || window.innerWidth;
    if (rect.right <= viewport) return fitsOnRight;

    // The parent is the submenu wrapper around the trigger row: the list is drawn `gap` px beside it.
    const parent = element.parentElement ? element.parentElement.getBoundingClientRect() : rect;
    const gap = Math.max(0, rect.left - parent.right);
    if (parent.left - gap - rect.width >= 0) return { side: 'left', offset: 0, maxWidth: 0 };

    // Neither side has room (TR-024): keep the roomier side and pull the list back inside the window.
    const limit = viewport - 2 * MARGIN;
    const maxWidth = rect.width > limit ? limit : 0;
    const width = maxWidth || rect.width;
    if (parent.left > viewport - parent.right) {
        const offset = Math.max(0, MARGIN - (parent.left - gap - width));
        return { side: 'left', offset, maxWidth };
    }
    const offset = Math.max(0, parent.right + gap + width - (viewport - MARGIN));
    return { side: 'right', offset, maxWidth };
}

/**
 * Tells which side a submenu fits on. Kept for callers of the earlier module shape.
 * @param {HTMLElement} element - The submenu list, drawn on the right
 * @returns {string} "left" or "right"
 */
export function fitSide(element) {
    return fit(element).side;
}
