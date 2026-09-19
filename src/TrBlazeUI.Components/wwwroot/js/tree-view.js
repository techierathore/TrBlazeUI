/**
 * TreeView keyboard support (WAI-ARIA tree pattern).
 *
 * Focus movement happens here because Blazor cannot cancel a key's default action per key - without
 * that, Up/Down/Home/End/Space would scroll the page while moving through the tree. What a key
 * changes (expand, collapse, select) is sent to .NET, which owns that state.
 *
 * Only expanded branches render their children, so every [role=treeitem] in the tree is visible and
 * document order is display order.
 */

/** @type {WeakMap<HTMLElement, Function>} */
const handlers = new WeakMap();

const itemsOf = (root) => [...root.querySelectorAll('[role=treeitem]')];
const labelOf = (item) => (item.querySelector(':scope > [data-slot=tree-item-row] [data-slot=tree-item-label]')?.textContent ?? '').trim().toLowerCase();

/**
 * Starts keyboard handling for a tree.
 * @param {HTMLElement} root - The element with role="tree".
 * @param {object} dotNetRef - DotNetObjectReference receiving OnKeyAction(itemId, action).
 */
export function attach(root, dotNetRef) {
    if (!root || handlers.has(root)) {
        return;
    }

    const send = (item, action) => dotNetRef.invokeMethodAsync('OnKeyAction', item.id, action).catch(() => { });

    const handler = (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        const item = event.target.closest('[role=treeitem]');
        if (!item || !root.contains(item) || event.target !== item) {
            return;
        }

        const items = itemsOf(root);
        const index = items.indexOf(item);
        const expanded = item.getAttribute('aria-expanded');
        let target = null;

        switch (event.key) {
            case 'ArrowDown':
                target = items[index + 1];
                break;
            case 'ArrowUp':
                target = items[index - 1];
                break;
            case 'Home':
                target = items[0];
                break;
            case 'End':
                target = items[items.length - 1];
                break;
            case 'ArrowRight':
                if (expanded === 'false') {
                    send(item, 'expand');
                } else if (expanded === 'true') {
                    target = item.querySelector(':scope > [role=group] > [role=treeitem]');
                }
                break;
            case 'ArrowLeft':
                if (expanded === 'true') {
                    send(item, 'collapse');
                } else {
                    target = item.parentElement?.closest('[role=treeitem]');
                }
                break;
            case 'Enter':
            case ' ':
                send(item, 'select');
                break;
            default:
                if (event.key.length === 1 && event.key.trim()) {
                    const key = event.key.toLowerCase();
                    const ordered = [...items.slice(index + 1), ...items.slice(0, index)];
                    target = ordered.find(i => labelOf(i).startsWith(key));
                    if (!target) {
                        return;
                    }
                    break;
                }
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
 * Stops keyboard handling for a tree.
 * @param {HTMLElement} root - The element with role="tree".
 */
export function detach(root) {
    const handler = root ? handlers.get(root) : null;
    if (handler) {
        root.removeEventListener('keydown', handler);
        handlers.delete(root);
    }
}
