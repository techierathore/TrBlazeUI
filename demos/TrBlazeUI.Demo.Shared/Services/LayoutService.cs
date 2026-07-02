using Microsoft.JSInterop;

namespace TrBlazeUI.Demo.Services;

/// <summary>
/// Service for managing layout mode state (vertical sidebar vs horizontal nav).
/// Handles toggling with localStorage persistence.
/// </summary>
public class LayoutService
{
    private readonly IJSRuntime objJsRuntime;
    private bool objIsHorizontal;
    private bool objIsInitialized;

    /// <summary>
    /// Event raised when the layout mode changes.
    /// </summary>
    public event Action? OnLayoutChanged;

    /// <summary>
    /// Gets whether horizontal layout is currently enabled.
    /// </summary>
    public bool IsHorizontal => objIsHorizontal;

    /// <summary>
    /// Initializes a new instance of the <see cref="LayoutService"/> class.
    /// </summary>
    /// <param name="jsRuntime">The JavaScript runtime used to read and persist the layout preference.</param>
    public LayoutService(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    /// <summary>
    /// Initializes the layout service by loading the saved preference from localStorage.
    /// </summary>
    public async Task InitializeAsync()
    {
        if (objIsInitialized)
        {
            return;
        }

        try
        {
            var savedLayout = await objJsRuntime.InvokeAsync<string?>("localStorage.getItem", "trblazeui:layout");
            objIsHorizontal = savedLayout == "horizontal";
            objIsInitialized = true;
        }
        catch
        {
            objIsHorizontal = false;
            objIsInitialized = true;
        }
    }

    /// <summary>
    /// Sets the layout mode.
    /// </summary>
    /// <param name="isHorizontal">True for horizontal, false for vertical.</param>
    public async Task SetLayoutAsync(bool isHorizontal)
    {
        if (objIsHorizontal == isHorizontal)
        {
            return;
        }

        objIsHorizontal = isHorizontal;

        try
        {
            var layout = isHorizontal ? "horizontal" : "vertical";
            await objJsRuntime.InvokeVoidAsync("localStorage.setItem", "trblazeui:layout", layout);
        }
        catch
        {
            // Ignore errors if localStorage is not available
        }

        OnLayoutChanged?.Invoke();
    }
}
