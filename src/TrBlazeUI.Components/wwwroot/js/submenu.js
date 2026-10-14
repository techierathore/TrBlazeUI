/**
 * Submenu placement for MenubarSubContent, DropdownMenuSubContent and ContextMenuSubContent
 * (Chatur TR-020). A submenu opens to the right of its trigger row; when that would run past the
 * right edge of the window it opens to the left instead.
 */

/**
 * Tells which side a submenu fits on.
 * @param {HTMLElement} element - The submenu list, drawn on the right
 * @returns {string} "left" when the list runs past the window's right edge and there is more room on the left, else "right"
 */
export function fitSide(element) {
    if (!element || !element.isConnected) return 'right';
    const rect = element.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth || window.innerWidth;
    if (rect.right <= viewport) return 'right';
    const parent = element.parentElement ? element.parentElement.getBoundingClientRect() : rect;
    return parent.left > viewport - parent.right ? 'left' : 'right';
}
