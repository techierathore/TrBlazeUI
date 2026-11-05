namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// Where a submenu list is drawn, as <c>submenu.js</c> measured it (Chatur TR-020, TR-024):
/// the side it opens on, and how far it is pulled back so it stays inside the window.
/// </summary>
internal sealed class SubmenuPlacement
{
    /// <summary>The placement every list starts with: on the right, as first drawn, with no shift.</summary>
    internal static readonly SubmenuPlacement Default = new();

    /// <summary>Gets or sets the side the list opens on: <c>right</c> or <c>left</c>.</summary>
    public string Side { get; set; } = "right";

    /// <summary>
    /// Gets or sets how far, in CSS pixels, the list is pulled back toward its row so its far
    /// edge stays inside the window. Zero when it fits where it is drawn.
    /// </summary>
    public double Offset { get; set; }

    /// <summary>Gets or sets the width cap, in CSS pixels, when the list is wider than the window; zero for none.</summary>
    public double MaxWidth { get; set; }
}
