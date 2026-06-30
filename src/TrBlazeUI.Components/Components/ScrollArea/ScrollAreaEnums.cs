namespace TrBlazeUI.Components.ScrollArea;

/// <summary>
/// Specifies when the scrollbars of a scroll area are visible.
/// </summary>
public enum ScrollAreaType
{
    /// <summary>
    /// Scrollbars are shown automatically only when the content overflows.
    /// </summary>
    Auto,

    /// <summary>
    /// Scrollbars are always visible regardless of whether the content overflows.
    /// </summary>
    Always,

    /// <summary>
    /// Scrollbars are shown only while the pointer hovers over the scroll area.
    /// </summary>
    Hover,

    /// <summary>
    /// Scrollbars are never visible, even when the content overflows.
    /// </summary>
    Hidden
}

/// <summary>
/// Specifies the scrolling orientation supported by a scroll area.
/// </summary>
public enum ScrollAreaOrientation
{
    /// <summary>
    /// Scrolling is enabled along the vertical axis only.
    /// </summary>
    Vertical,

    /// <summary>
    /// Scrolling is enabled along the horizontal axis only.
    /// </summary>
    Horizontal,

    /// <summary>
    /// Scrolling is enabled along both the vertical and horizontal axes.
    /// </summary>
    Both
}
