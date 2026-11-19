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

    // Measured as the list would be drawn beside its row with no placement of ours applied, so the
    // answer does not depend on the last one: the caller asks again whenever the list renders,
    // because its rows can change while it is open (Chatur TR-025: Chatur re-reads its recent
    // projects when File is pressed, the list grew after it was placed and ran 8 px past the margin).
    const width = naturalWidth(element);
    const viewport = document.documentElement.clientWidth || window.innerWidth;

    // The parent is the submenu wrapper around the trigger row: the list is drawn `gap` px beside it.
    const parent = (element.parentElement || element).getBoundingClientRect();
    const style = getComputedStyle(element);
    const gap = Math.max(parseFloat(style.marginLeft) || 0, parseFloat(style.marginRight) || 0);
    if (parent.right + gap + width <= viewport) return fitsOnRight;
    if (parent.left - gap - width >= 0) return { side: 'left', offset: 0, maxWidth: 0 };

    // Neither side has room (TR-024): keep the roomier side and pull the list back inside the window.
    const limit = viewport - 2 * MARGIN;
    const maxWidth = width > limit ? limit : 0;
    const drawn = maxWidth || width;
    if (parent.left > viewport - parent.right) {
        const offset = Math.max(0, MARGIN - (parent.left - gap - drawn));
        return { side: 'left', offset, maxWidth };
    }
    const offset = Math.max(0, parent.right + gap + drawn - (viewport - MARGIN));
    return { side: 'right', offset, maxWidth };
}

/**
 * The list's width with no pull-back and no width cap of ours on it. The inline styles are lifted
 * for one synchronous layout read and put back before the browser paints, so nothing flickers.
 * offsetWidth is the layout width, which a transform (an entry animation, a zoom) does not change.
 * @param {HTMLElement} element - The submenu list
 * @returns {number} Its width in CSS pixels
 */
function naturalWidth(element) {
    const saved = [element.style.left, element.style.right, element.style.maxWidth];
    element.style.left = '';
    element.style.right = '';
    element.style.maxWidth = '';
    const width = element.offsetWidth;
    [element.style.left, element.style.right, element.style.maxWidth] = saved;
    return width;
}

/**
 * Tells which side a submenu fits on. Kept for callers of the earlier module shape.
 * @param {HTMLElement} element - The submenu list, drawn on the right
 * @returns {string} "left" or "right"
 */
export function fitSide(element) {
    return fit(element).side;
}
