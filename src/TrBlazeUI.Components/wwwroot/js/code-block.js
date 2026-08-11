/**
 * CodeBlock clipboard helper.
 *
 * navigator.clipboard only exists in a SECURE context, so it is undefined on any plain-HTTP origin
 * that is not localhost - which covers most intranet deployments and every LAN-IP test run. Without
 * a fallback the copy button silently does nothing there.
 */

/**
 * Copies text to the clipboard, falling back to execCommand on non-secure origins.
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} True when the text reached the clipboard.
 */
export async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Permission denied - fall through to the legacy path.
        }
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.setAttribute('aria-hidden', 'true');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);

    try {
        area.select();
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        area.remove();
    }
}
