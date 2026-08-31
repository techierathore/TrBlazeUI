using TrBlazeUI.Components.Utilities;
using TrBlazeUI.Primitives.Table;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.DataTable;

/// <summary>
/// A styled data table component that wraps the Table Primitive with automatic sorting,
/// filtering, pagination, and row selection capabilities.
/// </summary>
/// <typeparam name="TData">The type of data items in the table.</typeparam>
/// <remarks>
/// <para>
/// DataTable provides a complete table solution with declarative column definitions,
/// automatic data processing, and shadcn styling. It handles common table features
/// out-of-the-box while maintaining flexibility through templates and callbacks.
/// </para>
/// <para>
/// Features:
/// - Declarative column API via DataTableColumn child components
/// - Automatic sorting, filtering, and pagination (hybrid mode with overrides)
/// - Row selection (single/multiple) with checkboxes
/// - Optional toolbar with global search and column visibility toggle
/// - Empty and loading state templates
/// - Full shadcn styling with hover states and transitions
/// - Accessibility support (ARIA attributes, keyboard navigation)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;DataTable TData="Person" Data="@people" SelectionMode="DataTableSelectionMode.Multiple"&gt;
///     &lt;Columns&gt;
///         &lt;DataTableColumn Property="@(p => p.Name)" Header="Name" Sortable Filterable /&gt;
///         &lt;DataTableColumn Property="@(p => p.Age)" Header="Age" Sortable /&gt;
///     &lt;/Columns&gt;
/// &lt;/DataTable&gt;
/// </code>
/// </example>
public partial class DataTable<TData> : ComponentBase where TData : class
{
    /// <summary>
    /// Public class for storing column data without component parameters.
    /// This avoids BL0005 warnings when creating column instances programmatically.
    /// </summary>
    public class ColumnData
    {
        /// <summary>
        /// Gets or sets the unique identifier for the column.
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the header text displayed for the column.
        /// </summary>
        public string Header { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the function that extracts the column value from a data item.
        /// </summary>
        public Func<TData, object?> Property { get; set; } = null!;

        /// <summary>
        /// Gets or sets the format string used to format the cell value.
        /// </summary>
        public string? Format { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the column can be sorted.
        /// </summary>
        public bool Sortable { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the column can be filtered.
        /// </summary>
        public bool Filterable { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the column is currently visible.
        /// </summary>
        public bool Visible { get; set; } = true;

        /// <summary>
        /// Gets or sets the width of the column (e.g., "200px", "20%", "auto").
        /// </summary>
        public string? Width { get; set; }

        /// <summary>
        /// Gets or sets the minimum width of the column.
        /// </summary>
        public string? MinWidth { get; set; }

        /// <summary>
        /// Gets or sets the maximum width of the column.
        /// </summary>
        public string? MaxWidth { get; set; }

        /// <summary>
        /// Gets or sets a custom template for rendering cell values.
        /// </summary>
        public RenderFragment<TData>? CellTemplate { get; set; }

        /// <summary>
        /// Gets or sets additional CSS classes to apply to cells in the column.
        /// </summary>
        public string? CellClass { get; set; }

        /// <summary>
        /// Gets or sets additional CSS classes to apply to the header cell.
        /// </summary>
        public string? HeaderClass { get; set; }
    }

    private List<ColumnData> objColumns = new();
    private TableState<TData> objTableState = new();
    private IEnumerable<TData> objProcessedData = Array.Empty<TData>();
    private IEnumerable<TData> objFilteredData = Array.Empty<TData>();
    private string objGlobalSearchValue = string.Empty;
    private int objColumnsVersion;
    private bool objSelectAllDropdownOpen;

    // ShouldRender tracking fields
    private IEnumerable<TData>? objLastData;
    private DataTableSelectionMode objLastSelectionMode;
    private bool objLastIsLoading;
    private int objLastColumnsVersion;
    private string objLastGlobalSearchValue = string.Empty;
    private int objSelectionVersion;
    private int objLastSelectionVersion;
    private IReadOnlyCollection<TData>? objLastSelectedItems;
    private int objPaginationVersion;
    private int objLastPaginationVersion;
    private int objRefreshVersion;
    private int objLastRefreshVersion;

    // ShowPagination now decides how many rows are materialised (TR-009), and ShowHeader/Density
    // change the rendered markup (TR-012/TR-025), so all three have to participate in ShouldRender.
    // Without this a consumer toggling any of them at runtime would see nothing repaint.
    private bool objLastShowPagination = true;
    private bool objLastShowHeader = true;
    private DataTableDensity objLastDensity = DataTableDensity.Comfortable;

    /// <summary>
    /// Gets or sets the data source for the table.
    /// </summary>
    [Parameter, EditorRequired]
    public IEnumerable<TData> Data { get; set; } = Array.Empty<TData>();

    /// <summary>
    /// Gets or sets the column definitions as child content.
    /// Use DataTableColumn components to define columns declaratively.
    /// </summary>
    [Parameter]
    public RenderFragment? Columns { get; set; }

    /// <summary>
    /// Gets or sets the row selection mode.
    /// Default is None (no selection).
    /// </summary>
    [Parameter]
    public DataTableSelectionMode SelectionMode { get; set; } = DataTableSelectionMode.None;

    /// <summary>
    /// Gets or sets whether to show the toolbar with global search and column visibility.
    /// Default is false — the toolbar is opt-in so a bare table renders as just a table.
    /// </summary>
    [Parameter]
    public bool ShowToolbar { get; set; }

    /// <summary>
    /// Gets or sets whether the grid paginates at all.
    /// Default is true, in which case the pagination bar still auto-suppresses when every
    /// filtered row fits on a single page.
    /// </summary>
    /// <remarks>
    /// This is a data switch, not only a chrome switch: setting it to <c>false</c> renders the
    /// ENTIRE filtered sequence and hides the pager. Previously the page window was applied
    /// unconditionally, so a grid with pagination turned off silently rendered only the first
    /// <see cref="InitialPageSize"/> rows with no pager and no row count to give the truncation
    /// away (TR-009).
    /// </remarks>
    [Parameter]
    public bool ShowPagination { get; set; } = true;

    /// <summary>
    /// Gets or sets whether the header row renders.
    /// Default is true; set to false for key/value style tables that need no column headings.
    /// </summary>
    /// <remarks>
    /// Only the rendered <c>thead</c> is suppressed. Column metadata comes from the cascaded
    /// <c>DataTableColumn</c> children, so sorting, filtering and column registration are
    /// unaffected — though with no header there is nothing left to click to sort (TR-012).
    /// </remarks>
    [Parameter]
    public bool ShowHeader { get; set; } = true;

    /// <summary>
    /// Gets or sets the cell padding density.
    /// Default is <see cref="DataTableDensity.Comfortable"/>.
    /// </summary>
    /// <remarks>
    /// <see cref="DataTableDensity.Compact"/> trims header cells to <c>h-9 px-2.5</c> and body
    /// cells to <c>px-2.5 py-2</c>, which reclaims a large share of the width on narrow grids
    /// (TR-025). A column's own <c>CellClass</c>/<c>HeaderClass</c> still wins over the density
    /// default, because it is merged last.
    /// </remarks>
    [Parameter]
    public DataTableDensity Density { get; set; } = DataTableDensity.Comfortable;

    /// <summary>
    /// Gets or sets whether the table is in a loading state.
    /// Default is false.
    /// </summary>
    [Parameter]
    public bool IsLoading { get; set; }

    /// <summary>
    /// Gets or sets whether keyboard navigation is enabled for table rows.
    /// When true, rows can be navigated with arrow keys and selected with Enter/Space.
    /// Default is true.
    /// </summary>
    [Parameter]
    public bool EnableKeyboardNavigation { get; set; } = true;

    /// <summary>
    /// Gets or sets the available page size options.
    /// Default is [5, 10, 20, 50, 100].
    /// </summary>
    [Parameter]
    public int[] PageSizes { get; set; } = { 5, 10, 20, 50, 100 };

    /// <summary>
    /// Gets or sets the initial page size.
    /// Default is 5.
    /// </summary>
    [Parameter]
    public int InitialPageSize { get; set; } = 5;

    /// <summary>
    /// Gets or sets custom toolbar actions (buttons, etc.).
    /// </summary>
    [Parameter]
    public RenderFragment? ToolbarActions { get; set; }

    /// <summary>
    /// Gets or sets a custom template for the empty state.
    /// If null, displays default "No results found" message.
    /// </summary>
    [Parameter]
    public RenderFragment? EmptyTemplate { get; set; }

    /// <summary>
    /// Gets or sets a custom template for the loading state.
    /// If null, displays default "Loading..." message.
    /// </summary>
    [Parameter]
    public RenderFragment? LoadingTemplate { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes for the container div.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to splat onto the table's root container.
    /// </summary>
    /// <remarks>
    /// Captures unmatched attributes (e.g. <c>data-testid</c>, <c>id</c>, arbitrary <c>data-*</c>)
    /// and forwards them to the rendered root, like a well-behaved Blazor component (TR-001).
    /// </remarks>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label for the table.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the selected items.
    /// Use @bind-SelectedItems for two-way binding.
    /// </summary>
    [Parameter]
    public IReadOnlyCollection<TData> SelectedItems { get; set; } = Array.Empty<TData>();

    /// <summary>
    /// Event callback invoked when the selected items change.
    /// </summary>
    [Parameter]
    public EventCallback<IReadOnlyCollection<TData>> SelectedItemsChanged { get; set; }

    /// <summary>
    /// Event callback invoked when sorting changes.
    /// Use for custom sorting logic (hybrid mode).
    /// </summary>
    [Parameter]
    public EventCallback<(string ColumnId, SortDirection Direction)> OnSort { get; set; }

    /// <summary>
    /// Event callback invoked when the global search value changes.
    /// Use for custom filtering logic (hybrid mode).
    /// </summary>
    [Parameter]
    public EventCallback<string?> OnFilter { get; set; }

    /// <summary>
    /// Gets or sets a function to preprocess data before automatic processing.
    /// Use for custom transformations or server-side data fetching.
    /// </summary>
    [Parameter]
    public Func<IEnumerable<TData>, Task<IEnumerable<TData>>>? PreprocessData { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the container.
    /// </summary>
    private string ContainerCssClass => ClassNames.cn(
        // min-w-0 lets the table's own root shrink inside a narrow (<=400px) flex/grid parent
        // so only the inner overflow-auto region scrolls horizontally instead of the page body
        // gaining residual overflow (TR-010). The pagination footer already wraps (flex-wrap).
        "w-full min-w-0 space-y-4",
        Class
    );

    /// <summary>
    /// Gets the computed CSS classes for the table container.
    /// relative + overflow-auto give the table a contained scroll region (shadcn Table
    /// pattern) and make this div the containing block for absolutely-positioned
    /// visually-hidden spans, so a wide table can never widen the page (TechieRag TR-004).
    /// </summary>
    private static string TableContainerCssClass => ClassNames.cn(
        "relative w-full overflow-x-auto rounded-md border"
    );

    /// <summary>
    /// Gets or sets a minimum width for the table, as a CSS length (for example <c>"720px"</c>).
    /// </summary>
    /// <remarks>
    /// The grid's own wrapper already scrolls horizontally, but the table is <c>w-full</c>, so
    /// without a minimum width it simply shrinks to its container and the right-hand columns are
    /// squeezed away with no scrollbar. Set this on wide tables (five columns or more) so the
    /// columns keep their natural width and the wrapper scrolls instead.
    /// </remarks>
    [Parameter]
    public string? MinWidth { get; set; }

    /// <summary>
    /// Gets the inline style applied to the table element.
    /// </summary>
    private string? TableStyle =>
        string.IsNullOrWhiteSpace(MinWidth) ? null : $"min-width:{MinWidth}";

    /// <summary>
    /// Gets the computed CSS classes for the table element.
    /// </summary>
    private static string TableCssClass => ClassNames.cn(
        "w-full caption-bottom text-sm"
    );

    /// <summary>
    /// Gets the density-driven base CSS classes for a header cell.
    /// </summary>
    /// <remarks>
    /// Merged FIRST so a column's <c>HeaderClass</c> still overrides the padding (TR-025).
    /// </remarks>
    private string HeaderCellCssClass => Density == DataTableDensity.Compact
        ? "h-9 px-2.5 text-left align-middle font-medium text-muted-foreground"
        : "h-12 px-4 text-left align-middle font-medium text-muted-foreground";

    /// <summary>
    /// Gets the density-driven base CSS classes for a body cell.
    /// </summary>
    /// <remarks>
    /// Merged FIRST so a column's <c>CellClass</c> still overrides the padding (TR-025).
    /// </remarks>
    private string BodyCellCssClass => Density == DataTableDensity.Compact
        ? "px-2.5 py-2 align-middle"
        : "p-4 align-middle";

    /// <summary>
    /// Performs one-time initialization of the table state, seeding the pagination page size and
    /// current page from <see cref="InitialPageSize"/> and applying the configured selection mode.
    /// </summary>
    protected override void OnInitialized()
    {
        objTableState.Pagination.PageSize = InitialPageSize;
        objTableState.Pagination.CurrentPage = 1;
        // Set selection mode on the state so Select/Deselect methods work correctly
        objTableState.Selection.Mode = GetPrimitiveSelectionMode();
    }

    /// <summary>
    /// Reacts to (re)assigned parameters by keeping the selection mode in sync, synchronizing the
    /// externally supplied <see cref="SelectedItems"/> into internal state, and reprocessing the data.
    /// </summary>
    /// <returns>A task that represents the asynchronous parameter-processing operation.</returns>
    protected override async Task OnParametersSetAsync()
    {
        // Keep selection mode in sync with parameter
        objTableState.Selection.Mode = GetPrimitiveSelectionMode();

        // Sync SelectedItems parameter to internal state if changed externally
        // Skip if SelectedItems is the same reference as our internal collection (shouldn't happen with the copy we make, but defensive)
        if (!ReferenceEquals(SelectedItems, objLastSelectedItems) &&
            !ReferenceEquals(SelectedItems, objTableState.Selection.SelectedItems))
        {
            objTableState.Selection.Clear();
            foreach (var item in SelectedItems)
            {
                objTableState.Selection.Select(item);
            }
            objLastSelectedItems = SelectedItems;
            objSelectionVersion++;
        }

        await ProcessDataAsync();
    }

    /// <summary>
    /// Registers a column with the data table.
    /// Called by DataTableColumn during initialization.
    /// </summary>
    internal void RegisterColumn<TValue>(DataTableColumn<TData, TValue> column)
    {
        // Create internal column data structure (avoids BL0005 component parameter warnings)
        var columnData = new ColumnData
        {
            Id = column.Id ?? column.Header.ToLowerInvariant().Replace(" ", "-"),
            Header = column.Header,
            Property = item => column.Property(item),
            Format = column.Format,
            Sortable = column.Sortable,
            Filterable = column.Filterable,
            Visible = column.Visible,
            Width = column.Width,
            MinWidth = column.MinWidth,
            MaxWidth = column.MaxWidth,
            CellTemplate = column.CellTemplate,
            CellClass = column.CellClass,
            HeaderClass = column.HeaderClass
        };

        objColumns.Add(columnData);
    }

    /// <summary>
    /// Processes the data through filtering, sorting, and pagination pipelines.
    /// </summary>
    private async Task ProcessDataAsync()
    {
        var data = Data ?? Array.Empty<TData>();

        // 1. Preprocess (if custom function provided)
        if (PreprocessData != null)
        {
            data = await PreprocessData(data);
        }

        // 2. Apply filtering (column filters + global search)
        objFilteredData = ApplyFiltering(data);

        // 3. Apply sorting
        var sortedData = ApplySorting(objFilteredData);

        // 4. Update pagination total items BEFORE pagination
        objTableState.Pagination.TotalItems = sortedData.Count();

        // 5. Apply pagination — ONLY when the grid actually paginates.
        //    ShowPagination gates the data, not just the pager chrome: applying the page window
        //    unconditionally meant ShowPagination="false" rendered InitialPageSize rows and
        //    dropped the rest with no pager and no count to reveal the loss (TR-009).
        if (ShowPagination)
        {
            objProcessedData = sortedData
                .Skip(objTableState.Pagination.StartIndex)
                .Take(objTableState.Pagination.PageSize)
                .ToList();
        }
        else
        {
            // Pagination is off: the whole filtered/sorted sequence is the rendered page.
            // TotalItems (set above) therefore equals the rendered row count, which is what keeps
            // ShouldShowSelectAllPrompt() from offering a "select all N" scope that does not exist.
            objProcessedData = sortedData.ToList();
        }
    }

    /// <summary>
    /// Applies global search filtering to the data.
    /// </summary>
    private IEnumerable<TData> ApplyFiltering(IEnumerable<TData> data)
    {
        if (string.IsNullOrWhiteSpace(objGlobalSearchValue))
        {
            return data;
        }

        // Cache search value to avoid repeated property access in closure
        var searchValue = objGlobalSearchValue;

        // Pre-filter to only filterable columns to reduce iterations
        var filterableColumns = objColumns.Where(c => c.Filterable).ToList();
        if (filterableColumns.Count == 0)
        {
            filterableColumns = objColumns; // Fall back to all columns if none marked filterable
        }

        return data.Where(item => MatchesSearch(item, searchValue, filterableColumns));
    }

    /// <summary>
    /// Checks if an item matches the search criteria across the specified columns.
    /// Extracted method to reduce closure overhead and improve JIT optimization.
    /// </summary>
    private static bool MatchesSearch(TData item, string searchValue, List<ColumnData> columns)
    {
        foreach (var column in columns)
        {
            try
            {
                var value = column.Property(item);
                if (value == null)
                {
                    continue;
                }

                var stringValue = value.ToString();
                if (!string.IsNullOrEmpty(stringValue) &&
                    stringValue.Contains(searchValue, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            catch
            {
                // Skip columns that cause errors during property access
            }
        }
        return false;
    }

    /// <summary>
    /// Applies sorting to the data based on current sort state.
    /// </summary>
    private IEnumerable<TData> ApplySorting(IEnumerable<TData> data)
    {
        if (objTableState.Sorting.Direction == SortDirection.None)
        {
            return data;
        }

        var column = objColumns.FirstOrDefault(c => c.Id == objTableState.Sorting.SortedColumn);
        if (column == null)
        {
            return data;
        }

        var sorted = objTableState.Sorting.Direction == SortDirection.Ascending
            ? data.OrderBy(item => column.Property(item))
            : data.OrderByDescending(item => column.Property(item));

        return sorted;
    }

    /// <summary>
    /// Handles sort change events from the table primitive.
    /// </summary>
    private async Task HandleSortChange((string ColumnId, SortDirection Direction) sortInfo)
    {
        // Invoke custom callback if provided
        if (OnSort.HasDelegate)
        {
            await OnSort.InvokeAsync(sortInfo);
        }

        // Automatic sorting will happen in ProcessDataAsync via state binding
        await ProcessDataAsync();
        StateHasChanged();
    }

    /// <summary>
    /// Handles global search value changes.
    /// </summary>
    private async Task HandleGlobalSearchChanged(string value)
    {
        objGlobalSearchValue = value;

        // Invoke custom callback if provided
        if (OnFilter.HasDelegate)
        {
            await OnFilter.InvokeAsync(objGlobalSearchValue);
        }

        // Reset to first page when filtering
        objTableState.Pagination.CurrentPage = 1;

        await ProcessDataAsync();
        // StateHasChanged() not needed - Blazor auto-renders after async event handlers
    }

    /// <summary>
    /// Handles column visibility changes.
    /// </summary>
    private void HandleColumnVisibilityChanged(string columnId, bool visible)
    {
        var column = objColumns.FirstOrDefault(c => c.Id == columnId);
        if (column != null)
        {
            column.Visible = visible;

            // Increment version to signal change without list recreation
            objColumnsVersion++;

            StateHasChanged();
        }
    }

    /// <summary>
    /// Handles selection change events from the table primitive.
    /// </summary>
    private async Task HandleSelectionChange(IReadOnlyCollection<TData> selectedItems)
    {
        if (SelectedItemsChanged.HasDelegate)
        {
            // Pass a copy to avoid reference aliasing - if parent stores the reference
            // and we later call Clear(), it would clear the parent's collection too
            await SelectedItemsChanged.InvokeAsync(selectedItems.ToList().AsReadOnly());
        }
    }

    /// <summary>
    /// Determines whether the pagination bar should render.
    /// Requires <see cref="ShowPagination"/>, a non-loading table, and more filtered rows
    /// than fit on a single page — a grid whose rows fit one page shows no pagination chrome.
    /// </summary>
    private bool ShouldShowPagination() =>
        ShowPagination
        && !IsLoading
        && objTableState.Pagination.TotalItems > objTableState.Pagination.PageSize;

    /// <summary>
    /// Determines whether to show the select-all dropdown prompt.
    /// Returns true when total items exceed the current page count — which is never the case
    /// once <see cref="ShowPagination"/> is false, since every filtered row is then rendered.
    /// </summary>
    private bool ShouldShowSelectAllPrompt() =>
        objTableState.Pagination.TotalItems > objProcessedData.Count();

    /// <summary>
    /// Gets the total count of filtered items across all pages.
    /// </summary>
    private int GetTotalFilteredItemCount() =>
        objFilteredData.Count();

    /// <summary>
    /// Opens the select-all dropdown menu.
    /// </summary>
    private void OpenSelectAllDropdown()
    {
        objSelectAllDropdownOpen = true;
        StateHasChanged();
    }

    /// <summary>
    /// Handles select all checkbox changes.
    /// When multiple pages exist, opens a dropdown for user to choose scope.
    /// </summary>
    private async Task HandleSelectAllChanged(bool isChecked)
    {
        if (!isChecked)
        {
            await HandleClearSelection();
            return;
        }

        if (ShouldShowSelectAllPrompt())
        {
            objSelectAllDropdownOpen = true;
            StateHasChanged();
            return;
        }

        await HandleSelectAllOnCurrentPage();
    }

    /// <summary>
    /// Selects all items on the current page only.
    /// </summary>
    private async Task HandleSelectAllOnCurrentPage()
    {
        foreach (var item in objProcessedData)
        {
            objTableState.Selection.Select(item);
        }
        objSelectAllDropdownOpen = false;
        objSelectionVersion++;
        await HandleSelectionChange(objTableState.Selection.SelectedItems);
        StateHasChanged();
    }

    /// <summary>
    /// Selects all items across all pages (entire filtered dataset).
    /// </summary>
    private async Task HandleSelectAllItems()
    {
        foreach (var item in objFilteredData)
        {
            objTableState.Selection.Select(item);
        }
        objSelectAllDropdownOpen = false;
        objSelectionVersion++;
        await HandleSelectionChange(objTableState.Selection.SelectedItems);
        StateHasChanged();
    }

    /// <summary>
    /// Clears all selected items.
    /// </summary>
    private async Task HandleClearSelection()
    {
        objTableState.Selection.Clear();
        objSelectAllDropdownOpen = false;
        objSelectionVersion++;
        await HandleSelectionChange(objTableState.Selection.SelectedItems);
        StateHasChanged();
    }

    /// <summary>
    /// Handles individual row selection changes.
    /// </summary>
    private async Task HandleRowSelectionChanged(TData item, bool isChecked)
    {
        if (isChecked)
        {
            objTableState.Selection.Select(item);
        }
        else
        {
            objTableState.Selection.Deselect(item);
        }

        objSelectionVersion++;  // Track selection change for ShouldRender
        await HandleSelectionChange(objTableState.Selection.SelectedItems);
        StateHasChanged();
    }

    /// <summary>
    /// Checks if all rows on the current page are selected.
    /// </summary>
    private bool IsAllSelected()
    {
        if (!objProcessedData.Any())
        {
            return false;
        }

        return objProcessedData.All(item => objTableState.Selection.IsSelected(item));
    }

    /// <summary>
    /// Checks if some (but not all) rows on the current page are selected.
    /// Used for the indeterminate state of the select-all checkbox.
    /// </summary>
    private bool IsSomeSelected()
    {
        if (!objProcessedData.Any())
        {
            return false;
        }

        var selectedCount = objProcessedData.Count(item => objTableState.Selection.IsSelected(item));
        return selectedCount > 0 && selectedCount < objProcessedData.Count();
    }

    /// <summary>
    /// Gets the column width style attribute.
    /// </summary>
    private static string? GetColumnWidthStyle(ColumnData column)
    {
        var styles = new List<string>();

        if (!string.IsNullOrWhiteSpace(column.Width))
        {
            styles.Add($"width: {column.Width}");
        }

        if (!string.IsNullOrWhiteSpace(column.MinWidth))
        {
            styles.Add($"min-width: {column.MinWidth}");
        }

        if (!string.IsNullOrWhiteSpace(column.MaxWidth))
        {
            styles.Add($"max-width: {column.MaxWidth}");
        }

        return styles.Count > 0 ? string.Join("; ", styles) : null;
    }

    /// <summary>
    /// Converts DataTableSelectionMode to primitive SelectionMode.
    /// </summary>
    private SelectionMode GetPrimitiveSelectionMode()
    {
        return SelectionMode switch
        {
            DataTableSelectionMode.None => Primitives.Table.SelectionMode.None,
            DataTableSelectionMode.Single => Primitives.Table.SelectionMode.Single,
            DataTableSelectionMode.Multiple => Primitives.Table.SelectionMode.Multiple,
            _ => Primitives.Table.SelectionMode.None
        };
    }

    /// <summary>
    /// Handles page change events from pagination component.
    /// </summary>
    private async Task HandlePageChanged(int newPage)
    {
        objPaginationVersion++;  // Track pagination change for ShouldRender
        await ProcessDataAsync();
        StateHasChanged();
    }

    /// <summary>
    /// Handles page size change events from pagination component.
    /// </summary>
    private async Task HandlePageSizeChanged(int newPageSize)
    {
        objPaginationVersion++;  // Track pagination change for ShouldRender
        await ProcessDataAsync();
        StateHasChanged();
    }

    /// <summary>
    /// Repaints the grid, including every <c>CellTemplate</c>, without replacing <c>Data</c>.
    /// </summary>
    /// <remarks>
    /// <para>
    /// The grid skips re-rendering while its <c>Data</c> reference is unchanged, which is what
    /// makes a large table cheap. Mutating a bound item IN PLACE - for example setting
    /// <c>row.Status = "Approved"</c> on the view model the grid is bound to - therefore leaves
    /// the cell showing the value it was first painted with, and a <c>StateHasChanged()</c> on
    /// the page cannot fix it because the decision is made inside the grid.
    /// </para>
    /// <para>
    /// Either reassign <c>Data</c> to a new collection, or capture the grid with <c>@ref</c> and
    /// call this method after an in-place edit:
    /// </para>
    /// <code>
    /// &lt;DataTable TData="CommentViewModel" Data="@objComments" @ref="objGrid"&gt; ... &lt;/DataTable&gt;
    ///
    /// comment.Status = "Approved";
    /// objGrid?.Refresh();
    /// </code>
    /// </remarks>
    public void Refresh()
    {
        objRefreshVersion++;
        StateHasChanged();
    }

    /// <summary>
    /// Skips re-rendering when nothing the grid displays has changed.
    /// </summary>
    /// <returns>True when the grid must repaint.</returns>
    protected override bool ShouldRender()
    {
        var refreshRequested = objLastRefreshVersion != objRefreshVersion;
        var dataChanged = !ReferenceEquals(objLastData, Data);
        var selectionModeChanged = objLastSelectionMode != SelectionMode;
        var loadingChanged = objLastIsLoading != IsLoading;
        var columnsChanged = objLastColumnsVersion != objColumnsVersion;
        var searchChanged = objLastGlobalSearchValue != objGlobalSearchValue;
        var selectionChanged = objLastSelectionVersion != objSelectionVersion;
        var paginationChanged = objLastPaginationVersion != objPaginationVersion;
        var showPaginationChanged = objLastShowPagination != ShowPagination;
        var showHeaderChanged = objLastShowHeader != ShowHeader;
        var densityChanged = objLastDensity != Density;

        if (refreshRequested || dataChanged || selectionModeChanged || loadingChanged || columnsChanged || searchChanged || selectionChanged || paginationChanged || showPaginationChanged || showHeaderChanged || densityChanged)
        {
            objLastShowPagination = ShowPagination;
            objLastShowHeader = ShowHeader;
            objLastDensity = Density;
            objLastRefreshVersion = objRefreshVersion;
            objLastData = Data;
            objLastSelectionMode = SelectionMode;
            objLastIsLoading = IsLoading;
            objLastColumnsVersion = objColumnsVersion;
            objLastGlobalSearchValue = objGlobalSearchValue;
            objLastSelectionVersion = objSelectionVersion;
            objLastPaginationVersion = objPaginationVersion;
            return true;
        }

        return false;
    }
}
