namespace TrBlazeUI.Components.ContextMenu;

/// <summary>
/// A row of a context menu the arrow keys can move to: a ContextMenuItem or a
/// ContextMenuSubTrigger (Chatur TR-020).
/// </summary>
public interface IContextMenuItem
{
    /// <summary>
    /// Gets whether the row is disabled; the arrow keys skip it.
    /// </summary>
    public bool IsDisabled { get; }

    /// <summary>
    /// Moves the focus to the row.
    /// </summary>
    /// <returns>A task that completes when the row has the focus.</returns>
    public Task FocusAsync();
}
