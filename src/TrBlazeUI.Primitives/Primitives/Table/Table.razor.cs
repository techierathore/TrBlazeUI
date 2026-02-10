using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Primitives.Table;

/// <summary>
/// Headless table primitive component providing sorting, pagination, and selection capabilities.
/// This component wraps the HTML table element and provides behavior without styling.
/// </summary>
/// <typeparam name="TData">The type of data items in the table.</typeparam>
public partial class Table<TData> : ComponentBase, IDisposable where TData : class
{
    private TableContext<TData> objContext = null!;
    private TableState<TData> objInternalState = new();
    private IEnumerable<TData> objProcessedData = Array.Empty<TData>();
    private int objStateVersion;
    private readonly List<Task> objPendingTasks = new();

    // ShouldRender tracking fields
    private int objLastRenderVersion;
    private IEnumerable<TData>? objLastData;
    private SelectionMode objLastSelectionMode;
    private bool objLastManualPagination;

    /// <summary>
    /// The data source for the table.
    /// </summary>
    [Parameter, EditorRequired]
    public IEnumerable<TData> Data { get; set; } = Array.Empty<TData>();

    /// <summary>
    /// The table state (controlled mode).
    /// When provided, the table uses external state management.
    /// </summary>
    [Parameter]
    public TableState<TData>? State { get; set; }

    /// <summary>
    /// Event callback invoked when the table state changes (for controlled mode).
    /// Use with @bind-State for two-way binding.
    /// </summary>
    [Parameter]
    public EventCallback<TableState<TData>> StateChanged { get; set; }

    /// <summary>
    /// The selection mode for the table.
    /// </summary>
    [Parameter]
    public SelectionMode SelectionMode { get; set; } = SelectionMode.None;

    /// <summary>
    /// Event callback invoked when sorting changes.
    /// </summary>
    [Parameter]
    public EventCallback<(string ColumnId, SortDirection Direction)> OnSortChange { get; set; }

    /// <summary>
    /// Event callback invoked when a row is selected.
    /// </summary>
    [Parameter]
    public EventCallback<TData> OnRowSelect { get; set; }

    /// <summary>
    /// Event callback invoked when the current page changes.
    /// </summary>
    [Parameter]
    public EventCallback<int> OnPageChange { get; set; }

    /// <summary>
    /// Event callback invoked when the page size changes.
    /// </summary>
    [Parameter]
    public EventCallback<int> OnPageSizeChange { get; set; }

    /// <summary>
    /// Event callback invoked when the selection changes.
    /// </summary>
    [Parameter]
    public EventCallback<IReadOnlyCollection<TData>> OnSelectionChange { get; set; }

    /// <summary>
    /// Child content for the table (TableHeader, TableBody, etc.).
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// ARIA label for the table.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Additional CSS classes to apply to the table element.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Additional attributes to apply to the table element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// When true, the table will not automatically set TotalItems based on data count.
    /// Use this when the parent component handles pagination and passes pre-paginated data.
    /// </summary>
    [Parameter]
    public bool ManualPagination { get; set; } = false;

    /// <summary>
    /// When true, enables keyboard navigation for table rows (arrow keys to navigate, Enter/Space to select).
    /// Default is true.
    /// </summary>
    [Parameter]
    public bool EnableKeyboardNavigation { get; set; } = true;

    /// <summary>
    /// Gets whether the table is in controlled mode.
    /// </summary>
    private bool IsControlled => State != null;

    /// <summary>
    /// Gets the current effective state (external or internal).
    /// </summary>
    private TableState<TData> EffectiveState => IsControlled ? State! : objInternalState;

    /// <summary>
    /// Gets the table context provided to child components.
    /// </summary>
    private TableContext<TData> Context => objContext;

    /// <summary>
    /// Initializes the table component, setting up context, event handlers, and processing initial data.
    /// </summary>
    protected override void OnInitialized()
    {
        InitializeContext();
        SetupEventHandlers();
        ProcessData();
    }

    /// <summary>
    /// Initializes the table context with effective state.
    /// </summary>
    private void InitializeContext()
    {
        objContext = new TableContext<TData>(EffectiveState)
        {
            SelectionMode = SelectionMode,
            EnableKeyboardNavigation = EnableKeyboardNavigation
        };

        SyncSelectionMode();
    }

    /// <summary>
    /// Synchronizes the SelectionMode parameter with the TableState's Selection.Mode property.
    /// This ensures consistency between the primitive's parameter and internal state, allowing
    /// selection operations to function correctly. Without this synchronization, the SelectionState
    /// would retain its default Mode value (None), causing Select() to return early without effect.
    /// </summary>
    private void SyncSelectionMode() => EffectiveState.Selection.Mode = SelectionMode;

    /// <summary>
    /// Sets up event handlers for sorting, pagination, and selection.
    /// </summary>
    private void SetupEventHandlers()
    {
        objContext.OnSortChange = (columnId, direction) =>
        {
            var task = InvokeAsync(async () =>
            {
                try
                {
                    if (OnSortChange.HasDelegate)
                    {
                        await OnSortChange.InvokeAsync((columnId, direction));
                    }

                    await NotifyStateChangedAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error in OnSortChange: {ex.Message}");
                }
            });
            objPendingTasks.Add(task);
        };

        objContext.OnPageChange = (page) =>
        {
            var task = InvokeAsync(async () =>
            {
                try
                {
                    if (OnPageChange.HasDelegate)
                    {
                        await OnPageChange.InvokeAsync(page);
                    }

                    await NotifyStateChangedAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error in OnPageChange: {ex.Message}");
                }
            });
            objPendingTasks.Add(task);
        };

        objContext.OnPageSizeChange = (pageSize) =>
        {
            var task = InvokeAsync(async () =>
            {
                try
                {
                    if (OnPageSizeChange.HasDelegate)
                    {
                        await OnPageSizeChange.InvokeAsync(pageSize);
                    }

                    await NotifyStateChangedAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error in OnPageSizeChange: {ex.Message}");
                }
            });
            objPendingTasks.Add(task);
        };

        objContext.OnRowSelect = (item) =>
        {
            var task = InvokeAsync(async () =>
            {
                try
                {
                    if (OnRowSelect.HasDelegate)
                    {
                        await OnRowSelect.InvokeAsync(item);
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error in OnRowSelect: {ex.Message}");
                }
            });
            objPendingTasks.Add(task);
        };

        objContext.OnSelectionChange = (selectedItems) =>
        {
            var task = InvokeAsync(async () =>
            {
                try
                {
                    if (OnSelectionChange.HasDelegate)
                    {
                        await OnSelectionChange.InvokeAsync(selectedItems);
                    }

                    await NotifyStateChangedAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Error in OnSelectionChange: {ex.Message}");
                }
            });
            objPendingTasks.Add(task);
        };

        objContext.OnStateChanged += HandleContextStateChanged;
    }

    /// <summary>
    /// Updates the table when parameters change, synchronizing state and reprocessing data.
    /// Handles both controlled (external state) and uncontrolled (internal state) modes.
    /// </summary>
    protected override void OnParametersSet()
    {
        // Update context with new parameters
        objContext.SelectionMode = SelectionMode;
        objContext.EnableKeyboardNavigation = EnableKeyboardNavigation;

        // Sync SelectionMode to the actual TableState
        SyncSelectionMode();

        // If controlled mode and state changed, update context
        if (IsControlled && objContext.State != State)
        {
            objContext.State = State!;
            objStateVersion++;
        }

        // Reprocess data when parameters change
        ProcessData();
    }

    /// <summary>
    /// Processes the data through pagination pipeline.
    /// Note: Sorting is handled by the developer - provide pre-sorted data to the Data parameter.
    /// </summary>
    private void ProcessData()
    {
        var currentState = EffectiveState;
        var data = Data ?? Array.Empty<TData>();

        // Update total items for pagination (unless parent handles it manually)
        if (!ManualPagination)
        {
            currentState.Pagination.TotalItems = data.Count();
        }

        // Apply pagination (skip if parent already paginated the data)
        objProcessedData = ManualPagination
            ? data.ToArray()
            : data.ApplyPagination(currentState.Pagination) ?? Array.Empty<TData>();

        // Update context with processed data
        objContext.ProcessedData = objProcessedData;
    }

    /// <summary>
    /// Handles state changes from the context.
    /// </summary>
    private void HandleContextStateChanged()
    {
        objStateVersion++;
        ProcessData();

        // Notify parent if in controlled mode
        if (IsControlled && StateChanged.HasDelegate)
        {
            _ = StateChanged.InvokeAsync(State!);
        }

        StateHasChanged();
    }

    /// <summary>
    /// Notifies that state has changed and triggers re-processing.
    /// </summary>
    private async Task NotifyStateChangedAsync()
    {
        objStateVersion++;
        ProcessData();

        // Notify parent if in controlled mode
        if (IsControlled && StateChanged.HasDelegate)
        {
            await StateChanged.InvokeAsync(State!);
        }

        StateHasChanged();
    }

    /// <summary>
    /// Determines whether the component should re-render based on tracked state changes.
    /// For controlled mode (with @bind-State), always returns true since state may be modified in-place.
    /// For uncontrolled mode, tracks parameter and version changes for optimization.
    /// </summary>
    /// <returns>True if the component should re-render.</returns>
    protected override bool ShouldRender()
    {
        // For controlled mode, always allow re-render since state may be modified in-place
        if (IsControlled)
        {
            return true;
        }

        // For uncontrolled mode, check if anything relevant has changed
        var dataChanged = !ReferenceEquals(objLastData, Data);
        var selectionModeChanged = objLastSelectionMode != SelectionMode;
        var paginationChanged = objLastManualPagination != ManualPagination;
        var versionChanged = objLastRenderVersion != objStateVersion;

        if (dataChanged || selectionModeChanged || paginationChanged || versionChanged)
        {
            objLastData = Data;
            objLastSelectionMode = SelectionMode;
            objLastManualPagination = ManualPagination;
            objLastRenderVersion = objStateVersion;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Gets the ARIA row count for the table.
    /// </summary>
    private int GetAriaRowCount() => EffectiveState.Pagination.TotalItems + 1; // +1 for header row

    /// <summary>
    /// Disposes the component, cleaning up event subscriptions and waiting for pending async operations.
    /// </summary>
    public void Dispose()
    {
        GC.SuppressFinalize(this);
        objContext.OnStateChanged -= HandleContextStateChanged;

        // Wait for pending tasks with timeout to prevent memory leaks
        // Note: Task.WaitAll with timeout is not supported in browser/WASM context
        if (objPendingTasks.Count > 0)
        {
            try
            {
                if (!OperatingSystem.IsBrowser())
                {
                    Task.WaitAll(objPendingTasks.ToArray(), TimeSpan.FromSeconds(1));
                }
            }
            catch (AggregateException)
            {
                // Tasks were cancelled or timed out - this is expected during disposal
            }
            finally
            {
                objPendingTasks.Clear();
            }
        }
    }
}
