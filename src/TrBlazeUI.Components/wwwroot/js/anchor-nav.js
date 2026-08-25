/**
 * AnchorNav JavaScript module.
 * Watches the sections an in-page navigation points at and reports the active one back to Blazor.
 */

const observers = new Map();

/**
 * Scrolls to a section without resolving a fragment against the document base URI.
 * @param {string} sectionId - Target element id.
 * @param {number} topOffset - Pixels of sticky chrome above the content.
 */
export function navigate(sectionId, topOffset) {
    const target = document.getElementById(sectionId);
    if (!target) {
        return;
    }

    const top = window.scrollY + target.getBoundingClientRect().top - (topOffset || 0);
    window.scrollTo({ top, behavior: 'smooth' });
    const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(sectionId)}`;
    window.history.replaceState(window.history.state, '', url);
}

/**
 * Starts observing the supplied section ids.
 * @param {string} navId - Unique id for this AnchorNav instance.
 * @param {string[]} sectionIds - The element ids to watch, in document order.
 * @param {object} dotNetRef - Reference to the AnchorNav component.
 * @param {number} topOffset - Pixels of sticky chrome above the content.
 */
export function observe(navId, sectionIds, dotNetRef, topOffset) {
    disconnect(navId);

    const elements = sectionIds
        .map(id => document.getElementById(id))
        .filter(el => el !== null);

    if (elements.length === 0) {
        return;
    }

    const visible = new Set();

    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                visible.add(entry.target.id);
            } else {
                visible.delete(entry.target.id);
            }
        }

        // The active section is the first one, in document order, that is currently on screen.
        const active = sectionIds.find(id => visible.has(id));
        if (active) {
            dotNetRef.invokeMethodAsync('OnActiveSectionChanged', active);
        }
    }, { rootMargin: `-${topOffset || 0}px 0px -60% 0px`, threshold: 0 });

    elements.forEach(el => observer.observe(el));
    observers.set(navId, observer);
}

/**
 * Stops observing for the supplied instance.
 * @param {string} navId - The AnchorNav instance id.
 */
export function disconnect(navId) {
    const existing = observers.get(navId);
    if (existing) {
        existing.disconnect();
        observers.delete(navId);
    }
}
