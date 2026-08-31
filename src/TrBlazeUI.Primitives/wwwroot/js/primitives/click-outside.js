// Click-outside detection for dropdowns, popovers, and dialogs

// Store cleanup functions with unique IDs to avoid passing functions through JS interop
const cleanupRegistry = new Map();
let cleanupIdCounter = 0;

/**
 * Waits for an element to appear in the DOM by ID.
 * @param {string} elementId - ID of the element to wait for
 * @param {number} maxWaitMs - Maximum time to wait in milliseconds
 * @param {number} intervalMs - Check interval in milliseconds
 * @returns {Promise<HTMLElement|null>} The element if found, null otherwise
 */
async function waitForElementById(elementId, maxWaitMs = 200, intervalMs = 10) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        const element = document.getElementById(elementId);
        if (element && document.body.contains(element)) {
            return element;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return null;
}

/**
 * Sets up click-outside detection for an element.
 * @param {HTMLElement} element - The element to monitor
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke on click outside
 * @param {HTMLElement} excludeElement - Optional element to exclude from outside detection (e.g., trigger button)
 * @returns {Object} Disposable object with dispose() method to remove listeners
 */
export function onClickOutside(element, dotNetRef, methodName = 'HandleClickOutside', excludeElement = null) {
    if (!element || !dotNetRef) {
        console.warn('click-outside: element or dotNetRef is null');
        return {
            _cleanupId: -1,
            dispose: function() {}
        };
    }

    let isMouseDownInside = false;

    const handleMouseDown = (e) => {
        isMouseDownInside = element.contains(e.target) || (excludeElement && excludeElement.contains(e.target));
    };

    const handleMouseUp = (e) => {
        // Only trigger if both mousedown and mouseup were outside (and not on excluded element)
        const isOutside = !element.contains(e.target) && !(excludeElement && excludeElement.contains(e.target));

        if (!isMouseDownInside && isOutside) {
            try {
                dotNetRef.invokeMethodAsync(methodName);
            } catch (error) {
                console.error('click-outside callback error:', error);
            }
        }
        isMouseDownInside = false;
    };

    // Use capture phase to ensure we catch events before they're stopped
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);

    // Store cleanup function in registry with unique ID
    const cleanupFunc = () => {
        document.removeEventListener('mousedown', handleMouseDown, true);
        document.removeEventListener('mouseup', handleMouseUp, true);
    };

    const id = cleanupIdCounter++;
    cleanupRegistry.set(id, cleanupFunc);

    // Return disposable object with ID (no arrow functions in the object)
    return {
        _cleanupId: id,
        dispose: function() {
            const cleanup = cleanupRegistry.get(this._cleanupId);
            if (cleanup) {
                cleanup();
                cleanupRegistry.delete(this._cleanupId);
            }
        }
    };
}

// Ordered stack of live Escape subscriptions. A document-level keydown listener is
// deliberately NOT scoped to the focused element (that is exactly the TR-014 bug: a
// re-render drops focus to <body> and an element handler stops firing), so ownership of
// the key has to be arbitrated here instead. Only the most recently registered
// subscription reacts, which makes a nested dialog close before the one that opened it.
const escapeStack = [];

/**
 * Sets up Escape key detection on the document.
 *
 * Unlike an element-scoped keydown handler this keeps working after the surface
 * re-renders and focus falls back to <body>. Ownership rules:
 *  - only the top-most (most recently registered) subscription reacts;
 *  - an event another handler already consumed (defaultPrevented) is ignored;
 *  - if `deferToSelector` matches a layer that does not contain the scope element, a
 *    transient layer (Select / Combobox / DropdownMenu / Popover content) is open on top
 *    and owns the key;
 *  - if `scopeElementId` is given and that element is gone, the surface is already
 *    torn down and the callback is skipped.
 *
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke on Escape
 * @param {string} scopeElementId - Optional id of the surface this subscription belongs to
 * @param {string} deferToSelector - Optional selector; when it matches, Escape is left to that layer
 * @returns {Object} Disposable object with dispose() method to remove listener
 */
export function onEscapeKey(dotNetRef, methodName = 'HandleEscape', scopeElementId = null, deferToSelector = null) {
    if (!dotNetRef) {
        console.warn('escape-key: dotNetRef is null');
        return {
            _cleanupId: -1,
            dispose: function() {}
        };
    }

    const entry = { dotNetRef, methodName };

    const handleKeyDown = (e) => {
        if (e.key !== 'Escape' || e.defaultPrevented) {
            return;
        }

        // Only the top-most surface owns the key.
        if (escapeStack.length === 0 || escapeStack[escapeStack.length - 1] !== entry) {
            return;
        }

        const scopeElement = scopeElementId ? document.getElementById(scopeElementId) : null;

        // The surface is already gone from the DOM - nothing to close.
        if (scopeElementId && !scopeElement) {
            return;
        }

        // A popup opened from inside this surface consumes Escape first. A layer that CONTAINS
        // this surface is skipped: a dialog declared inside a popover renders into that
        // popover's portal, and treating its own host as an inner layer would deadlock Escape.
        if (deferToSelector) {
            const layers = document.querySelectorAll(deferToSelector);
            for (const layer of layers) {
                if (!scopeElement || !layer.contains(scopeElement)) {
                    return;
                }
            }
        }

        try {
            if (!dotNetRef._disposed) {
                dotNetRef.invokeMethodAsync(methodName);
            }
        } catch (error) {
            console.error('escape-key callback error:', error);
        }
    };

    escapeStack.push(entry);
    document.addEventListener('keydown', handleKeyDown);

    // Store cleanup function in registry. Guarded so a double dispose (Blazor can call
    // both the explicit cleanup path and DisposeAsync) removes the listener exactly once.
    let isTornDown = false;
    const cleanupFunc = () => {
        if (isTornDown) {
            return;
        }
        isTornDown = true;
        document.removeEventListener('keydown', handleKeyDown);
        const index = escapeStack.indexOf(entry);
        if (index !== -1) {
            escapeStack.splice(index, 1);
        }
    };

    const id = cleanupIdCounter++;
    cleanupRegistry.set(id, cleanupFunc);

    return {
        _cleanupId: id,
        dispose: function() {
            const cleanup = cleanupRegistry.get(this._cleanupId);
            if (cleanup) {
                cleanup();
                cleanupRegistry.delete(this._cleanupId);
            }
        }
    };
}

/**
 * Sets up focus-outside detection (when focus leaves an element).
 * @param {HTMLElement} element - The element to monitor
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke on focus outside
 * @returns {Object} Disposable object with dispose() method to remove listeners
 */
export function onFocusOutside(element, dotNetRef, methodName = 'HandleFocusOutside') {
    if (!element || !dotNetRef) {
        console.warn('focus-outside: element or dotNetRef is null');
        return {
            _cleanupId: -1,
            dispose: function() {}
        };
    }

    const handleFocusIn = (e) => {
        if (!element.contains(e.target)) {
            try {
                if (dotNetRef && !dotNetRef._disposed) {
                    dotNetRef.invokeMethodAsync(methodName);
                }
            } catch (error) {
                console.error('focus-outside callback error:', error);
            }
        }
    };

    document.addEventListener('focusin', handleFocusIn, true);

    // Store cleanup function in registry
    const cleanupFunc = () => {
        document.removeEventListener('focusin', handleFocusIn, true);
    };

    const id = cleanupIdCounter++;
    cleanupRegistry.set(id, cleanupFunc);

    return {
        _cleanupId: id,
        dispose: function() {
            const cleanup = cleanupRegistry.get(this._cleanupId);
            if (cleanup) {
                cleanup();
                cleanupRegistry.delete(this._cleanupId);
            }
        }
    };
}

/**
 * Combined interaction-outside detector (click + focus).
 * @param {HTMLElement} element - The element to monitor
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke
 * @returns {Object} Disposable object with dispose() method to remove all listeners
 */
export function onInteractOutside(element, dotNetRef, methodName = 'HandleInteractOutside') {
    const cleanupClick = onClickOutside(element, dotNetRef, methodName);
    const cleanupFocus = onFocusOutside(element, dotNetRef, methodName);

    // Store combined cleanup in registry
    const cleanupFunc = () => {
        cleanupClick.dispose();
        cleanupFocus.dispose();
    };

    const id = cleanupIdCounter++;
    cleanupRegistry.set(id, cleanupFunc);

    return {
        _cleanupId: id,
        dispose: function() {
            const cleanup = cleanupRegistry.get(this._cleanupId);
            if (cleanup) {
                cleanup();
                cleanupRegistry.delete(this._cleanupId);
            }
        }
    };
}

/**
 * Sets up click-outside detection using element IDs. Waits for elements to appear in DOM.
 * This decouples C# timing from portal rendering - JS handles all waiting.
 * @param {string} elementId - ID of the element to monitor
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke on click outside
 * @param {string} excludeElementId - Optional ID of element to exclude from outside detection (e.g., trigger button)
 * @param {number} maxWaitMs - Maximum time to wait for elements in milliseconds
 * @returns {Promise<Object>} Disposable object with dispose() method, or no-op if element not found
 */
export async function onClickOutsideById(elementId, dotNetRef, methodName = 'HandleClickOutside', excludeElementId = null, maxWaitMs = 200) {
    const element = await waitForElementById(elementId, maxWaitMs);
    if (!element) {
        console.warn(`onClickOutsideById: Element ${elementId} not found within ${maxWaitMs}ms`);
        return {
            _cleanupId: -1,
            dispose: function() {}
        };
    }

    // Get exclude element if ID provided (no wait - it should already exist as it's the trigger)
    const excludeElement = excludeElementId ? document.getElementById(excludeElementId) : null;

    return onClickOutside(element, dotNetRef, methodName, excludeElement);
}

/**
 * Sets up click-outside detection using element IDs with pointerdown+pointerup pair validation.
 * CRITICAL: Only triggers close if BOTH pointerdown AND pointerup were outside.
 * This prevents spurious second pointerdown events (from Blazor Server re-renders) from
 * closing the popover, since they have no corresponding pointerup event.
 *
 * Handles nested portal scenarios (e.g., DatePicker → Calendar → Select dropdowns):
 * - Uses data-portal-content attribute for generic portal detection
 * - Tracks portal ID on pointerdown to handle portal removal before pointerup fires
 *   (event-based state tracking, not time-based grace periods)
 *
 * @param {string} elementId - ID of the element to monitor
 * @param {Object} dotNetRef - DotNet object reference for callback
 * @param {string} methodName - The method name to invoke on click outside
 * @param {string} excludeElementId - Optional ID of element to exclude from outside detection (e.g., trigger button)
 * @returns {Object} Disposable object with dispose() method
 */
export function onClickOutsideByIds(elementId, dotNetRef, methodName = 'HandleClickOutside', excludeElementId = null) {
    if (!elementId || !dotNetRef) {
        console.warn('click-outside: elementId or dotNetRef is null');
        return {
            _cleanupId: -1,
            dispose: function() {}
        };
    }

    let isEnabled = false;
    let isPointerDownInside = false;
    // Track which portal (by ID) the interaction started in, not just a boolean
    // This allows verification even after the portal is removed from DOM
    let nestedPortalIdOnPointerDown = null;

    // Check if target is inside a nested portal (Select, Combobox, etc.)
    // Uses data-portal-content attribute for generic, future-proof detection
    // Returns the portal ID if inside a nested portal, null otherwise
    // IMPORTANT: Distinguishes between PARENT portals (that contain our trigger) and
    // CHILD portals (opened from within our component). Only child portals should
    // prevent click-outside from closing.
    const getNestedPortalId = (target) => {
        // Check if click is inside ANY portal content using the data-portal-content attribute
        const portalContent = target.closest('[data-portal-content]');
        if (portalContent && portalContent.id !== elementId) {
            // Found a portal that's not our element
            // Check if it's a PARENT portal by seeing if our trigger is inside it
            const ourTrigger = excludeElementId ? document.getElementById(excludeElementId) : null;
            if (ourTrigger && portalContent.contains(ourTrigger)) {
                // Our trigger is inside this portal - it's a PARENT portal, not nested
                // Treat as normal click (not inside nested portal)
                return null;
            }
            // It's a sibling or child portal - return its ID
            return portalContent.id;
        }
        return null;
    };

    const handlePointerDown = (e) => {
        if (!isEnabled) return;

        let target = e.target;
        if (target && target.nodeType === Node.TEXT_NODE) {
            target = target.parentElement;
        }

        const element = document.getElementById(elementId);
        const excludeElement = excludeElementId ? document.getElementById(excludeElementId) : null;

        const isInsideContent = element && element.contains(target);
        const isInsideTrigger = excludeElement && excludeElement.contains(target);

        // Only check for nested portals if click is NOT on our trigger and NOT in our content
        // If click is on trigger/content, any parent portal (like Popover containing Select) is irrelevant
        const nestedPortalId = (isInsideContent || isInsideTrigger) ? null : getNestedPortalId(target);

        // Track whether pointerdown was inside
        isPointerDownInside = isInsideContent || isInsideTrigger || nestedPortalId !== null;

        // Store the portal ID (or null) - this allows us to know the interaction
        // started in a nested portal even after that portal is removed from DOM
        nestedPortalIdOnPointerDown = nestedPortalId;
    };

    const handlePointerUp = (e) => {
        if (!isEnabled) return;

        // If pointerdown was in a nested portal, don't close - even if portal is now gone
        // We tracked the interaction by ID, not by DOM presence
        if (nestedPortalIdOnPointerDown !== null) {
            isPointerDownInside = false;
            nestedPortalIdOnPointerDown = null;
            return;
        }

        let target = e.target;
        if (target && target.nodeType === Node.TEXT_NODE) {
            target = target.parentElement;
        }

        const element = document.getElementById(elementId);
        const excludeElement = excludeElementId ? document.getElementById(excludeElementId) : null;

        const isInsideContent = element && element.contains(target);
        const isInsideTrigger = excludeElement && excludeElement.contains(target);

        // Only check for nested portals if click is NOT on our trigger and NOT in our content
        const nestedPortalId = (isInsideContent || isInsideTrigger) ? null : getNestedPortalId(target);
        const isOutside = !isInsideContent && !isInsideTrigger && nestedPortalId === null;

        // Only close if BOTH pointerdown AND pointerup were outside
        // This prevents spurious second pointerdown (without pointerup) from closing
        if (!isPointerDownInside && isOutside) {
            try {
                dotNetRef.invokeMethodAsync(methodName);
            } catch (error) {
                console.error('click-outside callback error:', error);
            }
        }

        // Reset for next interaction
        isPointerDownInside = false;
        nestedPortalIdOnPointerDown = null;
    };

    // Use capture phase to catch events before they're stopped
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);

    // Enable after current event loop to avoid triggering on opening click
    setTimeout(() => {
        isEnabled = true;
    }, 0);

    const cleanupFunc = () => {
        isEnabled = false;
        document.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('pointerup', handlePointerUp, true);
    };

    const id = cleanupIdCounter++;
    cleanupRegistry.set(id, cleanupFunc);

    return {
        _cleanupId: id,
        dispose: function() {
            const cleanup = cleanupRegistry.get(this._cleanupId);
            if (cleanup) {
                cleanup();
                cleanupRegistry.delete(this._cleanupId);
            }
        }
    };
}
