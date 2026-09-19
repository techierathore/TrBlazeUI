namespace TrBlazeUI.Components.DiffView;

/// <summary>
/// Specifies how a <see cref="DiffView"/> lays out the two texts.
/// </summary>
public enum DiffViewMode
{
    /// <summary>
    /// The before text on the left and the after text on the right, changed lines paired.
    /// </summary>
    SideBySide,

    /// <summary>
    /// One column: removed lines above the added lines that replace them.
    /// </summary>
    Inline
}
