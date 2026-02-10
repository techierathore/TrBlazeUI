export function applyThemeColor(lightVars, darkVars) {
    let el = document.getElementById('trblazeui-theme-color');
    if (!el) {
        el = document.createElement('style');
        el.id = 'trblazeui-theme-color';
        document.head.appendChild(el);
    }
    let css = ':root {\n';
    for (const [key, value] of Object.entries(lightVars)) {
        css += `  ${key}: ${value};\n`;
    }
    css += '}\n.dark {\n';
    for (const [key, value] of Object.entries(darkVars)) {
        css += `  ${key}: ${value};\n`;
    }
    css += '}\n';
    el.textContent = css;
}

export function resetThemeColor() {
    const el = document.getElementById('trblazeui-theme-color');
    if (el) el.remove();
}

export function saveThemeColor(name) {
    localStorage.setItem('trblazeui:theme-color', name);
}

export function getThemeColor() {
    return localStorage.getItem('trblazeui:theme-color');
}
