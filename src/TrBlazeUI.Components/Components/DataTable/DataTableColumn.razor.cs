using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.DataTable;

/// <summary>
/// Defines a column in a DataTable with declarative syntax.
/// </summary>
/// <typeparam name="TData">The type of data items in the table.</typeparam>
/// <typeparam name="TValue">The type of the column's value.</typeparam>
/// <remarks>
/// <para>
/// DataTableColumn provides a declarative way to define table columns using Razor syntax.
/// Each column specifies how to extract data (Property), display headers (Header), and
/// optionally render custom cell content (CellTemplate).
/// </para>
/// <para>
/// Features:
/// - Type-safe data access via Property parameter (Func&lt;TData, TValue&gt;)
/// - Sortable and Filterable flags for automatic behavior
/// - Custom cell rendering via CellTemplate
/// - Column visibility toggle support
/// - Width configuration (Width, MinWidth, MaxWidth)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;DataTableColumn TData="Person" TValue="string"
///                  Property="@(p => p.Name)"
///                  Header="Full Name"
///                  Sortable="true"
///                  Filterable="true" /&gt;
/// </code>
/// </example>
public partial class DataTableColumn<TData, TValue> : ComponentBase where TData : class
{
    /// <summary>
    /// Gets or sets the unique identifier for this column.
    /// If not provided, it will be auto-generated from the Header.
    /// </summary>
    [Parameter]
    public string? Id { get; set; }

    /// <summary>
    /// Gets or sets the header text displayed for this column.
    /// </summary>
    [Parameter, EditorRequired]
    public string Header { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the function that extracts the column value from a data item.
    /// This enables type-safe data access.
    /// </summary>
    [Parameter, EditorRequired]
    public Func<TData, TValue?> Property { get; set; } = null!;

    /// <summary>
    /// Gets or sets the format string used to format the cell value.
    /// </summary>
    [Parameter]
    public string? Format { get; set; }

    /// <summary>
    /// Gets or sets whether this column can be sorted.
    /// Default is false.
    /// </summary>
    [Parameter]
    public bool Sortable { get; set; }

    /// <summary>
    /// Gets or sets whether this column can be filtered.
    /// Default is false.
    /// </summary>
    [Parameter]
    public bool Filterable { get; set; }

    /// <summary>
    /// Gets or sets whether this column is currently visible.
    /// Default is true.
    /// </summary>
    [Parameter]
    public bool Visible { get; set; } = true;

    /// <summary>
    /// Gets or sets the width of the column (e.g., "200px", "20%", "auto").
    /// Null means the column will size automatically.
    /// </summary>
    [Parameter]
    public string? Width { get; set; }

    /// <summary>
    /// Gets or sets the minimum width of the column (e.g., "100px").
    /// Useful for responsive layouts.
    /// </summary>
    [Parameter]
    public string? MinWidth { get; set; }

    /// <summary>
    /// Gets or sets the maximum width of the column (e.g., "400px").
    /// Useful for preventing excessively wide columns.
    /// </summary>
    [Parameter]
    public string? MaxWidth { get; set; }

    /// <summary>
    /// Gets or sets a custom template for rendering cell values.
    /// If null, the value is rendered using ToString().
    /// </summary>
    /// <remarks>
    /// The context parameter provides the data item (TData) for the row.
    /// </remarks>
    /// <example>
    /// <code>
    /// &lt;DataTableColumn Property="@(p => p.Status)" Header="Status"&gt;
    ///     &lt;CellTemplate Context="person"&gt;
    ///         &lt;Badge Variant="@(person.Status == "Active" ? BadgeVariant.Default : BadgeVariant.Destructive)"&gt;
    ///             @person.Status
    ///         &lt;/Badge&gt;
    ///     &lt;/CellTemplate&gt;
    /// &lt;/DataTableColumn&gt;
    /// </code>
    /// </example>
    [Parameter]
    public RenderFragment<TData>? CellTemplate { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to cells in this column.
    /// </summary>
    [Parameter]
    public string? CellClass { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the header cell.
    /// </summary>
    /// <remarks>
    /// The header label is rendered inside a flex box, so a <c>text-right</c> or
    /// <c>text-center</c> here reaches the <c>th</c> but cannot move the label itself. Where this
    /// class carries one of those and <see cref="Align"/> was not set, the table applies the
    /// matching <c>justify-*</c> to the label box so the intent is honoured anyway (TfLens TR-031);
    /// <see cref="Align"/> is the parameter to reach for in new markup.
    /// </remarks>
    [Parameter]
    public string? HeaderClass { get; set; }

    /// <summary>
    /// Gets or sets the horizontal alignment of the column's header label and of every cell in it.
    /// </summary>
    /// <remarks>
    /// Leave null to align from <see cref="CellClass"/> / <see cref="HeaderClass"/> as before.
    /// Setting it aligns the header cell, the header's own label box and the body cells together,
    /// which is what a figure column needs and what neither class parameter could do alone
    /// (TfLens TR-031).
    /// </remarks>
    /// <example>
    /// <code>
    /// &lt;DataTableColumn TData="Rate" TValue="decimal" Property="@(r =&gt; r.InputPerMillion)"
    ///                  Header="Input" Align="DataTableColumnAlign.End"
    ///                  CellClass="tabular-nums" /&gt;
    /// </code>
    /// </example>
    [Parameter]
    public DataTableColumnAlign? Align { get; set; }

    /// <summary>
    /// Gets the alignment this column is drawn with, falling back to the alignment implied by
    /// <see cref="HeaderClass"/> when <see cref="Align"/> was not set.
    /// </summary>
    internal DataTableColumnAlign EffectiveAlign
    {
        get
        {
            if (Align is not null)
            {
                return Align.Value;
            }

            if (HeaderClass is null)
            {
                return DataTableColumnAlign.Start;
            }

            if (HasClass(HeaderClass, "text-right") || HasClass(HeaderClass, "text-end"))
            {
                return DataTableColumnAlign.End;
            }

            return HasClass(HeaderClass, "text-center")
                ? DataTableColumnAlign.Center
                : DataTableColumnAlign.Start;
        }
    }

    /// <summary>
    /// Gets the flex justification the header's label box is given for this column.
    /// </summary>
    internal string HeaderJustifyClass => EffectiveAlign switch
    {
        DataTableColumnAlign.End => "justify-end",
        DataTableColumnAlign.Center => "justify-center",
        _ => "justify-start"
    };

    /// <summary>
    /// Gets the text alignment applied to this column's header and body cells, or null when the
    /// caller did not ask for one and the cell classes should stand alone.
    /// </summary>
    internal string? AlignTextClass => Align switch
    {
        DataTableColumnAlign.End => "text-right",
        DataTableColumnAlign.Center => "text-center",
        DataTableColumnAlign.Start => "text-left",
        _ => null
    };

    /// <summary>
    /// Tests whether a space-separated class list contains one exact class.
    /// </summary>
    private static bool HasClass(string classList, string className)
    {
        var vIndex = classList.IndexOf(className, StringComparison.Ordinal);

        while (vIndex >= 0)
        {
            var vStartsCleanly = vIndex == 0 || char.IsWhiteSpace(classList[vIndex - 1]);
            var vEnd = vIndex + className.Length;
            var vEndsCleanly = vEnd == classList.Length || char.IsWhiteSpace(classList[vEnd]);

            if (vStartsCleanly && vEndsCleanly)
            {
                return true;
            }

            vIndex = classList.IndexOf(className, vIndex + 1, StringComparison.Ordinal);
        }

        return false;
    }

    /// <summary>
    /// Gets or sets the parent DataTable component.
    /// Automatically set via cascading parameter.
    /// </summary>
    [CascadingParameter]
    internal DataTable<TData>? ParentTable { get; set; }

    /// <summary>
    /// Gets the effective column ID (uses Id if provided, otherwise generates from Header).
    /// </summary>
    internal string EffectiveId => Id ?? Header.ToLowerInvariant().Replace(" ", "-");

    /// <summary>
    /// Performs one-time initialization that validates the column is nested inside a
    /// <see cref="DataTable{TData}"/> and registers itself with that parent table.
    /// </summary>
    protected override void OnInitialized()
    {
        if (ParentTable == null)
        {
            throw new InvalidOperationException(
                $"{nameof(DataTableColumn<TData, TValue>)} must be placed inside a {nameof(DataTable<TData>)} component.");
        }

        // Register this column with the parent table
        ParentTable.RegisterColumn(this);
    }
}
