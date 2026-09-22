/**
 * CodeEditor support: Tab indentation, Shift+Tab outdent, the Escape-then-Tab focus escape, and
 * keeping the line-number gutter (and the optional highlight layer) scrolled with the text.
 *
 * Why any of this is here rather than in .NET:
 *  - A key's default action can only be cancelled synchronously. Blazor cannot decide per keystroke
 *    whether to call preventDefault() without a round trip, and on a Server circuit that round trip
 *    arrives long after the browser has already moved focus to the next control.
 *  - Indenting needs the caret. selectionStart/selectionEnd only exist in the DOM, and the caret has
 *    to be restored in the same task that changed the text or it jumps to the end.
 *
 * The text is changed with document.execCommand('insertText') where it is available, because that
 * keeps the browser's own undo stack intact - Ctrl+Z after an indent undoes the indent, not the
 * whole field. Assigning textarea.value would wipe that stack. The assignment path is kept as a
 * fallback and dispatches its own 'input' event so Blazor's @oninput handler still sees the change
 * (execCommand fires that event itself).
 *
 * No syntax highlighting ships here: highlighting is an application choice and bundling a
 * highlighter would drag a large dependency into every consumer. See CodeEditor.Html.
 */

/** @type {WeakMap<HTMLElement, object>} */
const attached = new WeakMap();

/** Textareas whose next Tab must move focus instead of indenting (the user pressed Escape). */
const escaped = new WeakSet();

/**
 * Starts keyboard and scroll handling for one editor.
 * @param {HTMLElement} root - The element with data-slot="code-editor-body".
 */
export function attach(root) {
    if (!root || attached.has(root)) {
        return;
    }

    const textarea = root.querySelector('textarea[data-slot=code-editor-input]');
    if (!textarea) {
        return;
    }

    const onScroll = () => {
        const gutter = root.querySelector('[data-slot=code-editor-gutter]');
        if (gutter) {
            gutter.scrollTop = textarea.scrollTop;
        }

        const highlight = root.querySelector('[data-slot=code-editor-highlight]');
        if (highlight) {
            highlight.scrollTop = textarea.scrollTop;
            highlight.scrollLeft = textarea.scrollLeft;
        }
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            // Arm the escape hatch. The default action is left alone so a surrounding dialog or
            // popover still sees the key.
            escaped.add(textarea);
            return;
        }

        if (event.key !== 'Tab') {
            escaped.delete(textarea);
            return;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (escaped.has(textarea)) {
            // Escape came first: let the browser move focus out. WCAG 2.1.2 - no keyboard trap.
            escaped.delete(textarea);
            return;
        }

        if (textarea.readOnly || textarea.disabled) {
            return;
        }

        event.preventDefault();
        applyIndent(textarea, event.shiftKey);
        onScroll();
    };

    const onBlur = () => escaped.delete(textarea);

    textarea.addEventListener('keydown', onKeyDown);
    textarea.addEventListener('scroll', onScroll);
    textarea.addEventListener('blur', onBlur);
    attached.set(root, { textarea, onKeyDown, onScroll, onBlur });
    onScroll();
}

/**
 * Stops keyboard and scroll handling for one editor.
 * @param {HTMLElement} root - The element with data-slot="code-editor-body".
 */
export function detach(root) {
    const state = root ? attached.get(root) : null;
    if (!state) {
        return;
    }

    state.textarea.removeEventListener('keydown', state.onKeyDown);
    state.textarea.removeEventListener('scroll', state.onScroll);
    state.textarea.removeEventListener('blur', state.onBlur);
    escaped.delete(state.textarea);
    attached.delete(root);
}

/**
 * Reads the indent unit from the attributes .NET renders, so a changed TabSize or UseSpaces takes
 * effect without re-attaching.
 * @param {HTMLTextAreaElement} textarea - The editor's textarea.
 * @returns {string} One indent: that many spaces, or a single tab character.
 */
function indentUnitOf(textarea) {
    const size = Math.min(8, Math.max(1, parseInt(textarea.dataset.tabSize, 10) || 4));
    return textarea.dataset.useSpaces === 'false' ? '\t' : ' '.repeat(size);
}

/**
 * Indents or outdents at the caret, or every line the selection touches.
 * @param {HTMLTextAreaElement} textarea - The editor's textarea.
 * @param {boolean} outdent - True for Shift+Tab.
 */
function applyIndent(textarea, outdent) {
    const unit = indentUnitOf(textarea);
    const value = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const spansLines = value.slice(start, end).indexOf('\n') >= 0;

    if (!outdent && !spansLines) {
        // One indent at the caret, replacing whatever is selected on this line.
        replace(textarea, start, end, unit, start + unit.length, start + unit.length);
        return;
    }

    // A selection that ends exactly at the start of a line does not own that line.
    const lastIndex = end > start && value[end - 1] === '\n' ? end - 1 : end;
    const blockStart = value.lastIndexOf('\n', start - 1) + 1;
    const newlineAfter = value.indexOf('\n', lastIndex);
    const blockEnd = newlineAfter < 0 ? value.length : newlineAfter;

    let firstDelta = 0;
    let totalDelta = 0;
    const lines = value.slice(blockStart, blockEnd).split('\n').map((line, index) => {
        const delta = outdent ? -outdentWidth(line, unit.length) : unit.length;
        const next = outdent ? line.slice(-delta) : unit + line;
        if (index === 0) {
            firstDelta = delta;
        }

        totalDelta += delta;
        return next;
    });

    const newStart = Math.max(blockStart, start + firstDelta);
    const newEnd = Math.max(newStart, end + totalDelta);
    replace(textarea, blockStart, blockEnd, lines.join('\n'), newStart, newEnd);
}

/**
 * Measures how much leading whitespace one outdent removes from a line.
 * @param {string} line - The line's text.
 * @param {number} width - The indent width in spaces.
 * @returns {number} The number of characters to drop, possibly zero.
 */
function outdentWidth(line, width) {
    if (line.startsWith('\t')) {
        return 1;
    }

    let count = 0;
    while (count < width && line[count] === ' ') {
        count++;
    }

    return count;
}

/**
 * Replaces a range of the textarea, preserving the browser's undo stack where it can.
 * @param {HTMLTextAreaElement} textarea - The editor's textarea.
 * @param {number} from - The start of the range to replace.
 * @param {number} to - The end of the range to replace.
 * @param {string} text - The replacement text.
 * @param {number} selectionStart - Where the caret ends up.
 * @param {number} selectionEnd - Where the selection ends up.
 */
function replace(textarea, from, to, text, selectionStart, selectionEnd) {
    textarea.setSelectionRange(from, to);

    let inserted = false;
    try {
        inserted = typeof document.execCommand === 'function'
            && document.execCommand('insertText', false, text);
    } catch {
        inserted = false;
    }

    if (!inserted) {
        textarea.value = textarea.value.slice(0, from) + text + textarea.value.slice(to);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    textarea.setSelectionRange(selectionStart, selectionEnd);
}
