/**
 * Sidebar JavaScript module
 * Handles mobile detection, keyboard shortcuts, and state persistence
 */

const MOBILE_BREAKPOINT = 768;

let dotNetRef = null;
let cookieKey = null;
let resizeObserver = null;
let keyboardHandler = null;
let mobileQuery = null;
let checkMobile = null;
let lastIsMobile = null;

/**
 * Initialize sidebar with mobile detection and keyboard shortcuts
 * @param {DotNetObject} componentRef - Reference to the SidebarProvider component
 * @param {string} key - Cookie key for state persistence
 */
export function initializeSidebar(componentRef, key) {
    dotNetRef = componentRef;
    cookieKey = key;

    // Set up mobile detection
    setupMobileDetection();

    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

/**
 * Get sidebar state from cookie
 * @param {string} key - Cookie key
 * @returns {boolean|null} The saved state or null if not found
 */
export function getSidebarState(key) {
    const value = getCookie(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
}

/**
 * Save sidebar state to cookie
 * @param {string} key - Cookie key
 * @param {boolean} value - State to save
 */
export function saveSidebarState(key, value) {
    setCookie(key, value.toString(), 7); // 7 days expiration
}

/**
 * Set up mobile detection.
 *
 * The mode is decided by matchMedia, never by window.innerWidth read inside a ResizeObserver: in a
 * Mac Catalyst WKWebView the observer fires before innerWidth has taken the new size, so the old
 * width was reported, nothing corrected it, and a one-step resize 1280 -> 390 left the docked
 * sidebar squeezing the page (TrStudio TR-015). A media query is evaluated against the new layout
 * viewport whenever it is read. It is read on the query's own change event, on the window's resize
 * event, on the body's ResizeObserver, and once more on the next animation frame after each of
 * them, and only a change of mode is sent to .NET.
 */
function setupMobileDetection() {
    if (!dotNetRef) return;

    mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`);
    lastIsMobile = null;

    const report = () => {
        if (!dotNetRef || !mobileQuery) return;
        const isMobile = mobileQuery.matches;
        if (isMobile === lastIsMobile) return;
        lastIsMobile = isMobile;
        dotNetRef.invokeMethodAsync('OnMobileChange', isMobile);
    };

    checkMobile = () => {
        report();
        // A web view that settles its viewport late is caught on the next frame.
        window.requestAnimationFrame(report);
    };

    // Initial check
    report();

    mobileQuery.addEventListener('change', checkMobile);
    window.addEventListener('resize', checkMobile);

    resizeObserver = new ResizeObserver(checkMobile);
    resizeObserver.observe(document.body);
}

/**
 * Set up keyboard shortcuts for toggling sidebar
 */
function setupKeyboardShortcuts() {
    if (!dotNetRef) return;

    keyboardHandler = (e) => {
        // Check for Ctrl+B or Cmd+B
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            dotNetRef.invokeMethodAsync('OnToggleShortcut');
        }
    };

    document.addEventListener('keydown', keyboardHandler);
}

/**
 * Get cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Set cookie value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

/**
 * Cleanup event listeners and observers
 */
export function cleanup() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    if (checkMobile) {
        if (mobileQuery) mobileQuery.removeEventListener('change', checkMobile);
        window.removeEventListener('resize', checkMobile);
        checkMobile = null;
    }
    mobileQuery = null;
    lastIsMobile = null;

    if (keyboardHandler) {
        document.removeEventListener('keydown', keyboardHandler);
        keyboardHandler = null;
    }

    dotNetRef = null;
    cookieKey = null;
}
