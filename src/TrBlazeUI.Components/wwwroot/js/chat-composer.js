/**
 * ChatComposer support: Enter sends, Shift+Enter inserts a newline, and clearing the box after a
 * send while it still has focus.
 *
 * Why this is here rather than in .NET:
 *  - Whether Enter inserts a newline or sends can only be decided synchronously, in the keydown
 *    handler, with preventDefault(). Blazor cannot cancel a key's default action per keystroke
 *    without a round trip, and on a Server circuit the newline is already in the box by then.
 *  - The text control keeps the DOM value apart from the server echo and defers a parent's new
 *    value while the control has focus (so a slow echo never overwrites newer typing). A clear
 *    after a send therefore has to happen in the DOM itself, with an 'input' event so the bound
 *    value follows it.
 */

/** @type {WeakMap<HTMLElement, object>} */
const attached = new WeakMap();

/**
 * Starts Enter handling for one composer.
 * @param {HTMLElement} root - The element with data-slot="chat-composer".
 * @param {object} dotNetRef - The .NET object whose SendFromKeyboardAsync(text) is called on Enter.
 */
export function attach(root, dotNetRef) {
    if (!root || attached.has(root)) {
        return;
    }

    const textarea = root.querySelector('textarea');
    if (!textarea) {
        return;
    }

    const onKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) {
            return;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (textarea.disabled || textarea.readOnly) {
            return;
        }

        event.preventDefault();
        dotNetRef.invokeMethodAsync('SendFromKeyboardAsync', textarea.value);
    };

    textarea.addEventListener('keydown', onKeyDown);
    attached.set(root, { textarea, onKeyDown });
}

/**
 * Stops Enter handling for one composer.
 * @param {HTMLElement} root - The element with data-slot="chat-composer".
 */
export function detach(root) {
    const state = root ? attached.get(root) : null;
    if (!state) {
        return;
    }

    state.textarea.removeEventListener('keydown', state.onKeyDown);
    attached.delete(root);
}

/**
 * Empties the composer's text box in the DOM and tells Blazor through an 'input' event, so the
 * bound value follows even while the box keeps focus.
 * @param {HTMLElement} root - The element with data-slot="chat-composer".
 */
export function clear(root) {
    const textarea = root ? root.querySelector('textarea') : null;
    if (!textarea) {
        return;
    }

    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
