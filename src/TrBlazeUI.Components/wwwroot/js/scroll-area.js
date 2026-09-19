/**
 * ScrollArea "stick to end" follower.
 *
 * Keeps a viewport scrolled to its newest content while content is added, the way a terminal or a
 * build log does. Following stops the moment the reader scrolls away from the end and resumes when
 * they scroll back to it, so reading older lines is never interrupted.
 *
 * Why observers rather than a Blazor OnAfterRender scroll: content grows in ways Blazor never
 * re-renders the ScrollArea for (a child component updating its own text, an image loading, a font
 * swapping in). A MutationObserver sees every DOM change and a ResizeObserver every size change,
 * and both fire before the next paint, so the view never flashes one frame off the end.
 */

/** Distance in pixels from the end that still counts as "at the end" (sub-pixel zoom rounding). */
const EndThreshold = 24;

/** @type {WeakMap<HTMLElement, object>} */
const followers = new WeakMap();

/**
 * Starts following new content in a viewport.
 * @param {HTMLElement} viewport - The scrolling element.
 * @param {object | null} dotNetRef - Optional DotNetObjectReference receiving OnAtEndChanged(bool).
 */
export function attach(viewport, dotNetRef) {
    if (!viewport || followers.has(viewport)) {
        return;
    }

    const state = { atEnd: true, dotNetRef, mutation: null, resize: null, onScroll: null };

    const isAtEnd = () => viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= EndThreshold;
    const scrollToEnd = () => { viewport.scrollTop = viewport.scrollHeight; };
    const report = (value) => {
        viewport.dataset.atEnd = value ? 'true' : 'false';
        if (state.dotNetRef) {
            state.dotNetRef.invokeMethodAsync('OnAtEndChanged', value).catch(() => { });
        }
    };
    const follow = () => {
        if (state.atEnd) {
            scrollToEnd();
        }
    };

    state.onScroll = () => {
        const value = isAtEnd();
        if (value !== state.atEnd) {
            state.atEnd = value;
            report(value);
        }
    };

    state.resize = new ResizeObserver(follow);
    const observeChildren = () => {
        for (const child of viewport.children) {
            state.resize.observe(child);
        }
    };

    state.mutation = new MutationObserver((records) => {
        if (records.some(r => r.type === 'childList' && r.target === viewport)) {
            observeChildren();
        }
        follow();
    });

    state.resize.observe(viewport);
    observeChildren();
    state.mutation.observe(viewport, { childList: true, subtree: true, characterData: true });
    viewport.addEventListener('scroll', state.onScroll, { passive: true });

    followers.set(viewport, state);
    scrollToEnd();
    viewport.dataset.atEnd = 'true';
}

/**
 * Scrolls a viewport to its end and resumes following.
 * @param {HTMLElement} viewport - The scrolling element.
 */
export function scrollToEnd(viewport) {
    if (!viewport) {
        return;
    }

    viewport.scrollTop = viewport.scrollHeight;
    const state = followers.get(viewport);
    if (state && !state.atEnd) {
        state.atEnd = true;
        viewport.dataset.atEnd = 'true';
        if (state.dotNetRef) {
            state.dotNetRef.invokeMethodAsync('OnAtEndChanged', true).catch(() => { });
        }
    }
}

/**
 * Stops following a viewport.
 * @param {HTMLElement} viewport - The scrolling element.
 */
export function detach(viewport) {
    const state = viewport ? followers.get(viewport) : null;
    if (!state) {
        return;
    }

    state.mutation.disconnect();
    state.resize.disconnect();
    viewport.removeEventListener('scroll', state.onScroll);
    delete viewport.dataset.atEnd;
    followers.delete(viewport);
}
