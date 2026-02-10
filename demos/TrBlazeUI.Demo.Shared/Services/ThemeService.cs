using Microsoft.JSInterop;

namespace TrBlazeUI.Demo.Services;

/// <summary>
/// Service for managing dark mode theme state.
/// Handles toggling between light and dark themes with localStorage persistence.
/// </summary>
public class ThemeService
{
    private readonly IJSRuntime objJsRuntime;
    private bool objIsDarkMode;
    private bool objIsInitialized;

    /// <summary>
    /// Event raised when the theme changes.
    /// </summary>
    public event Action? OnThemeChanged;

    /// <summary>
    /// Gets whether dark mode is currently enabled.
    /// </summary>
    public bool IsDarkMode => objIsDarkMode;

    public ThemeService(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    /// <summary>
    /// Initializes the theme service by loading the saved preference from localStorage.
    /// Should be called once during application startup.
    /// </summary>
    public async Task InitializeAsync()
    {
        if (objIsInitialized)
        {
            return;
        }

        try
        {
            // Try to load saved preference from localStorage
            var savedTheme = await objJsRuntime.InvokeAsync<string?>("localStorage.getItem", "theme");

            objIsDarkMode = savedTheme == "dark";
            await ApplyThemeAsync(objIsDarkMode);

            objIsInitialized = true;
        }
        catch
        {
            // If localStorage is not available (SSR), default to light mode
            objIsDarkMode = false;
            objIsInitialized = true;
        }
    }

    /// <summary>
    /// Toggles between light and dark mode.
    /// </summary>
    public async Task ToggleThemeAsync()
    {
        objIsDarkMode = !objIsDarkMode;
        await ApplyThemeAsync(objIsDarkMode);
        await SaveThemeAsync(objIsDarkMode);

        OnThemeChanged?.Invoke();
    }

    /// <summary>
    /// Sets the theme to a specific mode.
    /// </summary>
    /// <param name="isDark">True for dark mode, false for light mode.</param>
    public async Task SetThemeAsync(bool isDark)
    {
        if (objIsDarkMode == isDark)
        {
            return;
        }

        objIsDarkMode = isDark;
        await ApplyThemeAsync(objIsDarkMode);
        await SaveThemeAsync(objIsDarkMode);

        OnThemeChanged?.Invoke();
    }

    /// <summary>
    /// Applies the theme by adding or removing the 'dark' class on the HTML element.
    /// </summary>
    private async Task ApplyThemeAsync(bool isDark)
    {
        try
        {
            if (isDark)
            {
                await objJsRuntime.InvokeVoidAsync("eval",
                    "document.documentElement.classList.add('dark')");
            }
            else
            {
                await objJsRuntime.InvokeVoidAsync("eval",
                    "document.documentElement.classList.remove('dark')");
            }
        }
        catch
        {
            // Ignore errors during SSR
        }
    }

    /// <summary>
    /// Saves the theme preference to localStorage.
    /// </summary>
    private async Task SaveThemeAsync(bool isDark)
    {
        try
        {
            var theme = isDark ? "dark" : "light";
            await objJsRuntime.InvokeVoidAsync("localStorage.setItem", "theme", theme);
        }
        catch
        {
            // Ignore errors if localStorage is not available
        }
    }
}
