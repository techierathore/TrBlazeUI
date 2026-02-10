namespace TrBlazeUI.Components.ResponsiveNav;

/// <summary>
/// State container for the responsive navigation component.
/// </summary>
public class ResponsiveNavState
{
    /// <summary>
    /// Whether the mobile menu is open.
    /// </summary>
    public bool OpenMobile { get; set; }

    /// <summary>
    /// Whether the current viewport is mobile.
    /// </summary>
    public bool IsMobile { get; set; }
}

/// <summary>
/// Context for managing responsive navigation state.
/// Provides state management and responsive behavior.
/// </summary>
public class ResponsiveNavContext
{
    private ResponsiveNavState objState = new();

    /// <summary>
    /// Gets the current navigation state.
    /// </summary>
    public ResponsiveNavState State => objState;

    /// <summary>
    /// Gets whether the mobile menu is currently open.
    /// </summary>
    public bool OpenMobile => objState.OpenMobile;

    /// <summary>
    /// Gets whether the current viewport is mobile.
    /// </summary>
    public bool IsMobile => objState.IsMobile;

    /// <summary>
    /// Event raised when the navigation state changes.
    /// </summary>
    public event EventHandler? StateChanged;

    /// <summary>
    /// Toggles the mobile menu open/closed state.
    /// </summary>
    public void Toggle() =>
        SetOpenMobile(!objState.OpenMobile);

    /// <summary>
    /// Sets the mobile menu open state.
    /// </summary>
    public void SetOpenMobile(bool open)
    {
        if (objState.OpenMobile != open)
        {
            objState.OpenMobile = open;
            OnStateChanged();
        }
    }

    /// <summary>
    /// Sets whether the viewport is mobile.
    /// Called by ResponsiveNavProvider via JS interop.
    /// </summary>
    public void SetIsMobile(bool isMobile)
    {
        if (objState.IsMobile != isMobile)
        {
            objState.IsMobile = isMobile;
            // Close mobile menu when switching to desktop
            if (!isMobile && objState.OpenMobile)
            {
                objState.OpenMobile = false;
            }
            OnStateChanged();
        }
    }

    private void OnStateChanged() =>
        StateChanged?.Invoke(this, EventArgs.Empty);
}
