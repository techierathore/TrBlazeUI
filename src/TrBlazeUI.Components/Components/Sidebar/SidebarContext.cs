namespace TrBlazeUI.Components.Sidebar;

/// <summary>
/// Represents the variant style of the sidebar.
/// </summary>
public enum SidebarVariant
{
    /// <summary>
    /// Default sidebar that pushes content.
    /// </summary>
    Sidebar,

    /// <summary>
    /// Floating sidebar that overlays content.
    /// </summary>
    Floating,

    /// <summary>
    /// Inset sidebar with padding.
    /// </summary>
    Inset
}

/// <summary>
/// Represents which side the sidebar appears on.
/// </summary>
public enum SidebarSide
{
    /// <summary>
    /// Sidebar appears on the left side.
    /// </summary>
    Left,

    /// <summary>
    /// Sidebar appears on the right side.
    /// </summary>
    Right
}

/// <summary>
/// State container for the sidebar component.
/// </summary>
public class SidebarState
{
    /// <summary>
    /// Whether the sidebar is open on desktop.
    /// </summary>
    public bool Open { get; set; } = true;

    /// <summary>
    /// Whether the sidebar is open on mobile.
    /// </summary>
    public bool OpenMobile { get; set; }

    /// <summary>
    /// Whether the current viewport is mobile.
    /// </summary>
    public bool IsMobile { get; set; }

    /// <summary>
    /// The variant/style of the sidebar.
    /// </summary>
    public SidebarVariant Variant { get; set; } = SidebarVariant.Sidebar;

    /// <summary>
    /// Which side the sidebar appears on.
    /// </summary>
    public SidebarSide Side { get; set; } = SidebarSide.Left;
}

/// <summary>
/// Context for managing sidebar state across all sidebar components.
/// Provides state management, responsive behavior, and keyboard shortcuts.
/// </summary>
public class SidebarContext
{
    private SidebarState objState = new();

    /// <summary>
    /// Gets the current sidebar state.
    /// </summary>
    public SidebarState State => objState;

    /// <summary>
    /// Gets whether the sidebar is currently open (desktop or mobile based on viewport).
    /// </summary>
    public bool IsOpen => objState.IsMobile ? objState.OpenMobile : objState.Open;

    /// <summary>
    /// Gets whether the sidebar is open on desktop.
    /// </summary>
    public bool Open => objState.Open;

    /// <summary>
    /// Gets whether the sidebar is open on mobile.
    /// </summary>
    public bool OpenMobile => objState.OpenMobile;

    /// <summary>
    /// Gets whether the current viewport is mobile.
    /// </summary>
    public bool IsMobile => objState.IsMobile;

    /// <summary>
    /// Gets the sidebar variant.
    /// </summary>
    public SidebarVariant Variant => objState.Variant;

    /// <summary>
    /// Gets which side the sidebar appears on.
    /// </summary>
    public SidebarSide Side => objState.Side;

    /// <summary>
    /// Gets or sets the width of the slid-out phone menu, as any CSS length, or null to use the
    /// stylesheet's <c>--sidebar-width-mobile</c>.
    /// </summary>
    /// <remarks>
    /// Set by <c>SidebarProvider.MobileWidth</c>. It is carried on the context rather than
    /// inherited as a custom property because the phone menu is a portalled Sheet rendered under
    /// <c>&lt;body&gt;</c>, outside the provider's subtree, so nothing declared on the provider's
    /// own element reaches it (TfLens TR-035).
    /// </remarks>
    public string? MobileWidth { get; set; }

    /// <summary>
    /// Event raised when the sidebar state changes.
    /// </summary>
    public event EventHandler? StateChanged;

    /// <summary>
    /// Toggles the sidebar open/closed state.
    /// On mobile, toggles OpenMobile. On desktop, toggles Open.
    /// </summary>
    public void ToggleSidebar()
    {
        if (objState.IsMobile)
        {
            SetOpenMobile(!objState.OpenMobile);
        }
        else
        {
            SetOpen(!objState.Open);
        }
    }

    /// <summary>
    /// Sets the desktop open state.
    /// </summary>
    public void SetOpen(bool open)
    {
        if (objState.Open != open)
        {
            objState.Open = open;
            OnStateChanged();
        }
    }

    /// <summary>
    /// Sets the mobile open state.
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
    /// Called by SidebarProvider via JS interop.
    /// </summary>
    public void SetIsMobile(bool isMobile)
    {
        if (objState.IsMobile != isMobile)
        {
            objState.IsMobile = isMobile;
            OnStateChanged();
        }
    }

    /// <summary>
    /// Sets the sidebar variant.
    /// </summary>
    public void SetVariant(SidebarVariant variant)
    {
        if (objState.Variant != variant)
        {
            objState.Variant = variant;
            OnStateChanged();
        }
    }

    /// <summary>
    /// Sets which side the sidebar appears on.
    /// </summary>
    public void SetSide(SidebarSide side)
    {
        if (objState.Side != side)
        {
            objState.Side = side;
            OnStateChanged();
        }
    }

    /// <summary>
    /// Initializes the state from values (typically from cookies or defaults).
    /// </summary>
    public void Initialize(bool? open = null, SidebarVariant? variant = null, SidebarSide? side = null)
    {
        var changed = false;

        if (open.HasValue && objState.Open != open.Value)
        {
            objState.Open = open.Value;
            changed = true;
        }

        if (variant.HasValue && objState.Variant != variant.Value)
        {
            objState.Variant = variant.Value;
            changed = true;
        }

        if (side.HasValue && objState.Side != side.Value)
        {
            objState.Side = side.Value;
            changed = true;
        }

        if (changed)
        {
            OnStateChanged();
        }
    }

    private void OnStateChanged() =>
        StateChanged?.Invoke(this, EventArgs.Empty);
}
