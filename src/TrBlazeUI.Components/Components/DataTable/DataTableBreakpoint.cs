namespace TrBlazeUI.Components.DataTable;

/// <summary>
/// A screen width below which a <c>DataTableColumn</c> is hidden, named after the Tailwind
/// breakpoint it maps to.
/// </summary>
/// <remarks>
/// A seven-column table on a 390 px phone either drops a column at every width or scrolls
/// sideways to reach its actions (Chatur TR-019). <c>HideBelow</c> keeps the column on wider
/// screens and drops its header and cells together below the chosen width. The table still owns
/// the column, so sorting, filtering and the column chooser are unaffected.
/// </remarks>
public enum DataTableBreakpoint
{
    /// <summary>
    /// Hidden below 640 px (Tailwind <c>sm</c>).
    /// </summary>
    Sm,

    /// <summary>
    /// Hidden below 768 px (Tailwind <c>md</c>).
    /// </summary>
    Md,

    /// <summary>
    /// Hidden below 1024 px (Tailwind <c>lg</c>).
    /// </summary>
    Lg,

    /// <summary>
    /// Hidden below 1280 px (Tailwind <c>xl</c>).
    /// </summary>
    Xl
}
