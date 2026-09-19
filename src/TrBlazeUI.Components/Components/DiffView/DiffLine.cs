namespace TrBlazeUI.Components.DiffView;

/// <summary>
/// One line of a comparison between two texts.
/// </summary>
public sealed class DiffLine
{
    /// <summary>
    /// Gets how the line differs between the two texts.
    /// </summary>
    public DiffLineKind Kind { get; init; }

    /// <summary>
    /// Gets the 1-based line number in the before text, or null for an added line.
    /// </summary>
    public int? OldNumber { get; init; }

    /// <summary>
    /// Gets the 1-based line number in the after text, or null for a removed line.
    /// </summary>
    public int? NewNumber { get; init; }

    /// <summary>
    /// Gets the line's text, without its line break. An unchanged line carries the after text.
    /// </summary>
    public string Text { get; init; } = string.Empty;
}
