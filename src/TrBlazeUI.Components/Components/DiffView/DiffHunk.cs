namespace TrBlazeUI.Components.DiffView;

/// <summary>
/// One part of a comparison: a run of changed lines with the unchanged lines around it.
/// </summary>
public sealed class DiffHunk
{
    /// <summary>
    /// Gets the 0-based position of this part in the comparison.
    /// </summary>
    public int Index { get; init; }

    /// <summary>
    /// Gets the 1-based line in the before text where the part starts (the line before it when
    /// <see cref="OldCount"/> is 0, as in a unified diff).
    /// </summary>
    public int OldStart { get; init; }

    /// <summary>
    /// Gets the number of before-text lines in the part.
    /// </summary>
    public int OldCount { get; init; }

    /// <summary>
    /// Gets the 1-based line in the after text where the part starts (the line before it when
    /// <see cref="NewCount"/> is 0, as in a unified diff).
    /// </summary>
    public int NewStart { get; init; }

    /// <summary>
    /// Gets the number of after-text lines in the part.
    /// </summary>
    public int NewCount { get; init; }

    /// <summary>
    /// Gets the part's lines in display order.
    /// </summary>
    public IReadOnlyList<DiffLine> Lines { get; init; } = [];

    /// <summary>
    /// Gets the position of the part's first line in the whole comparison.
    /// </summary>
    internal int StartIndex { get; init; }

    /// <summary>
    /// Gets the position of the part's last line in the whole comparison.
    /// </summary>
    internal int EndIndex { get; init; }

    /// <summary>
    /// Gets the number of added lines in the part.
    /// </summary>
    public int AddedCount => Lines.Count(l => l.Kind == DiffLineKind.Added);

    /// <summary>
    /// Gets the number of removed lines in the part.
    /// </summary>
    public int RemovedCount => Lines.Count(l => l.Kind == DiffLineKind.Removed);

    /// <summary>
    /// Gets the unified-diff header of the part, for example <c>@@ -12,7 +12,9 @@</c>.
    /// </summary>
    public string Header => $"@@ -{OldStart},{OldCount} +{NewStart},{NewCount} @@";
}
