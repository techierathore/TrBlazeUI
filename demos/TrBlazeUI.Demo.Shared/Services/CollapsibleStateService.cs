using Microsoft.JSInterop;

namespace TrBlazeUI.Demo.Services;

/// <summary>
/// Service for persisting collapsible menu state in browser localStorage.
/// </summary>
public class CollapsibleStateService
{
    private readonly IJSRuntime objJsRuntime;
    private const string LocalStoragePrefix = "trblazeui:collapsible:";

    /// <summary>
    /// Initializes a new instance of the <see cref="CollapsibleStateService"/> class.
    /// </summary>
    /// <param name="jsRuntime">The JavaScript runtime used to read and persist collapsible state in localStorage.</param>
    public CollapsibleStateService(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    /// <summary>
    /// Get the saved state for a collapsible menu.
    /// </summary>
    /// <param name="key">Unique identifier for the collapsible (e.g., "sidebar-primitives-menu")</param>
    /// <param name="defaultValue">Default value if no state is saved</param>
    /// <returns>True if the menu should be open, false otherwise</returns>
    public async Task<bool> GetStateAsync(string key, bool defaultValue = false)
    {
        try
        {
            var storageKey = LocalStoragePrefix + key;
            var value = await objJsRuntime.InvokeAsync<string?>("localStorage.getItem", storageKey);

            if (string.IsNullOrEmpty(value))
            {
                return defaultValue;
            }

            return bool.TryParse(value, out var result) && result;
        }
        catch
        {
            // If localStorage is not available or there's an error, return default
            return defaultValue;
        }
    }

    /// <summary>
    /// Save the state for a collapsible menu.
    /// </summary>
    /// <param name="key">Unique identifier for the collapsible</param>
    /// <param name="isOpen">Whether the menu is open</param>
    public async Task SetStateAsync(string key, bool isOpen)
    {
        try
        {
            var storageKey = LocalStoragePrefix + key;
            await objJsRuntime.InvokeVoidAsync("localStorage.setItem", storageKey, isOpen.ToString());
        }
        catch
        {
            // Silently fail if localStorage is not available
        }
    }

    /// <summary>
    /// Clear the saved state for a collapsible menu.
    /// </summary>
    /// <param name="key">Unique identifier for the collapsible</param>
    public async Task ClearStateAsync(string key)
    {
        try
        {
            var storageKey = LocalStoragePrefix + key;
            await objJsRuntime.InvokeVoidAsync("localStorage.removeItem", storageKey);
        }
        catch
        {
            // Silently fail if localStorage is not available
        }
    }

    /// <summary>
    /// Clear all saved collapsible states.
    /// </summary>
    public async Task ClearAllStatesAsync()
    {
        try
        {
            // Get all keys from localStorage
            var keys = await objJsRuntime.InvokeAsync<string[]>(
                "eval",
                $"Object.keys(localStorage).filter(k => k.startsWith('{LocalStoragePrefix}'))");

            // Remove each key
            foreach (var key in keys)
            {
                await objJsRuntime.InvokeVoidAsync("localStorage.removeItem", key);
            }
        }
        catch
        {
            // Silently fail if localStorage is not available
        }
    }
}
