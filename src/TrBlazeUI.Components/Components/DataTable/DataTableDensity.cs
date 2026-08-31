namespace TrBlazeUI.Components.DataTable;

/// <summary>
/// Specifies the cell padding density (row height) for a data table.
/// </summary>
public enum DataTableDensity
{
    /// <summary>
    /// Default spacing: header cells are <c>h-12 px-4</c> and body cells <c>p-4</c>.
    /// </summary>
    Comfortable = 0,

    /// <summary>
    /// Reduced spacing: header cells are <c>h-9 px-2.5</c> and body cells <c>px-2.5 py-2</c>.
    /// Use on narrow grids where the comfortable padding consumes a large share of the width.
    /// </summary>
    Compact = 1
}
