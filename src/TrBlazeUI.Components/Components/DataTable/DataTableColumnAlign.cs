namespace TrBlazeUI.Components.DataTable;

/// <summary>
/// Horizontal alignment applied to a column's header label and to every cell in it.
/// </summary>
/// <remarks>
/// A figure column is right-aligned in every table that has figures, and aligning it used to take
/// two parameters that did not agree: <c>CellClass="text-right"</c> moved the cells, while
/// <c>HeaderClass="text-right"</c> moved nothing, because the header label sits inside its own flex
/// box where <c>text-align</c> has no effect (TfLens TR-031). One <c>Align</c> reaches the header
/// cell, the label box and the body cells together.
/// </remarks>
public enum DataTableColumnAlign
{
    /// <summary>
    /// Aligned to the start of the column - the default, and what text columns want.
    /// </summary>
    Start,

    /// <summary>
    /// Centred in the column.
    /// </summary>
    Center,

    /// <summary>
    /// Aligned to the end of the column - what figure and money columns want.
    /// </summary>
    End
}
