namespace TrBlazeUI.Components.DiffView;

/// <summary>
/// Specifies how a line of a comparison differs between the before and the after text.
/// </summary>
public enum DiffLineKind
{
    /// <summary>
    /// The line is in both texts.
    /// </summary>
    Unchanged,

    /// <summary>
    /// The line is only in the after text.
    /// </summary>
    Added,

    /// <summary>
    /// The line is only in the before text.
    /// </summary>
    Removed
}
