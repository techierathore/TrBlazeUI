using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Command;

/// <summary>
/// Metadata for a registered command item.
/// </summary>
public class CommandItemMetadata
{
    /// <summary>
    /// Gets or sets the value of the command item.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the text used for search filtering.
    /// </summary>
    public string? SearchText { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the item is disabled.
    /// </summary>
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when this item is selected.
    /// </summary>
    public EventCallback OnSelect { get; set; }

    /// <summary>
    /// Gets or sets the group ID this item belongs to.
    /// </summary>
    public string? GroupId { get; set; }
}

/// <summary>
/// Interface for virtualized groups to participate in navigation.
/// </summary>
public interface IVirtualizedGroupHandler
{
    /// <summary>
    /// Gets the number of visible items in this virtualized group.
    /// </summary>
    public int VisibleItemCount { get; }

    /// <summary>
    /// Gets or sets the focused index within this group (-1 if not focused).
    /// </summary>
    public int FocusedIndex { get; set; }

    /// <summary>
    /// Selects the currently focused item.
    /// </summary>
    public Task SelectFocusedItemAsync();

    /// <summary>
    /// Notifies the group to re-render.
    /// </summary>
    public void NotifyStateChanged();

    /// <summary>
    /// Scrolls to a specific index and sets focus. Used for wrap-around navigation
    /// when the target item may not be loaded yet in lazy loading mode.
    /// </summary>
    /// <param name="index">The index to scroll to and focus.</param>
    public Task ScrollToIndexAsync(int index);
}

/// <summary>
/// Context for Command component and its children.
/// Manages search query, item registration, filtering, and keyboard navigation.
/// </summary>
public class CommandContext
{
    private readonly List<CommandItemMetadata> objItems = new();
    private readonly List<IVirtualizedGroupHandler> objVirtualizedGroups = new();
    private string objSearchQuery = string.Empty;
    private int objFocusedIndex = -1;
    private int objFocusedVirtualizedGroupIndex = -1; // Which virtualized group has focus (-1 = regular items)
    private Func<CommandItemMetadata, string, bool>? objFilterFunction;
    private bool objCloseOnSelect = true;
    private bool objDisabled;
    private bool objHasRegisteredItems;
    private bool objIsKeyboardNavigating; // Flag to suppress hover during keyboard nav

    /// <summary>
    /// Event that is raised when the state changes.
    /// </summary>
    public event Action? OnStateChanged;

    /// <summary>
    /// Event that is raised when focus changes. Parameters are (previousIndex, newIndex).
    /// </summary>
    public event Action<int, int>? OnFocusChanged;

    /// <summary>
    /// Event that is raised when the search query changes.
    /// </summary>
    public event Action? OnSearchChanged;

    /// <summary>
    /// Event that is raised when keyboard navigation state changes.
    /// </summary>
    public event Action<bool>? OnKeyboardNavigationChanged;

    /// <summary>
    /// Gets or sets the callback invoked when an item is selected.
    /// </summary>
    public EventCallback<string> OnValueChange { get; set; }

    /// <summary>
    /// Gets the unique ID for this command context.
    /// </summary>
    public string Id { get; } = $"command-{Guid.NewGuid():N}";

    /// <summary>
    /// Gets the ID for the command input.
    /// </summary>
    public string InputId => $"{Id}-input";

    /// <summary>
    /// Gets the ID for the command list.
    /// </summary>
    public string ListId => $"{Id}-list";

    /// <summary>
    /// Gets the current search query.
    /// </summary>
    public string SearchQuery => objSearchQuery;

    /// <summary>
    /// Gets or sets the custom filter function.
    /// </summary>
    public Func<CommandItemMetadata, string, bool>? FilterFunction
    {
        get => objFilterFunction;
        set => objFilterFunction = value;
    }

    /// <summary>
    /// Gets or sets whether to close the dropdown after selection.
    /// </summary>
    public bool CloseOnSelect
    {
        get => objCloseOnSelect;
        set => objCloseOnSelect = value;
    }

    /// <summary>
    /// Gets or sets whether the command is disabled.
    /// </summary>
    public bool Disabled
    {
        get => objDisabled;
        set => objDisabled = value;
    }

    /// <summary>
    /// Gets the currently focused item index within filtered items.
    /// </summary>
    public int FocusedIndex => objFocusedIndex;

    /// <summary>
    /// Gets the currently focused virtualized group index (-1 if focus is on regular items).
    /// </summary>
    public int FocusedVirtualizedGroupIndex => objFocusedVirtualizedGroupIndex;

    /// <summary>
    /// Gets whether keyboard navigation is currently active (suppresses mouse hover).
    /// </summary>
    public bool IsKeyboardNavigating => objIsKeyboardNavigating;

    /// <summary>
    /// Called when the mouse actually moves to re-enable hover focus.
    /// </summary>
    public void OnMouseMove()
    {
        if (objIsKeyboardNavigating)
        {
            objIsKeyboardNavigating = false;
            OnKeyboardNavigationChanged?.Invoke(false);
        }
    }

    /// <summary>
    /// Registers a virtualized group handler for navigation.
    /// </summary>
    public void RegisterVirtualizedGroup(IVirtualizedGroupHandler handler)
    {
        if (!objVirtualizedGroups.Contains(handler))
        {
            objVirtualizedGroups.Add(handler);
        }
    }

    /// <summary>
    /// Unregisters a virtualized group handler.
    /// </summary>
    public void UnregisterVirtualizedGroup(IVirtualizedGroupHandler handler) =>
        objVirtualizedGroups.Remove(handler);

    /// <summary>
    /// Gets the list of registered virtualized groups.
    /// </summary>
    public IReadOnlyList<IVirtualizedGroupHandler> GetVirtualizedGroups() =>
        objVirtualizedGroups.AsReadOnly();

    /// <summary>
    /// Sets focus on a specific virtualized group and clears focus from all other groups and regular items.
    /// This ensures only one item is focused at a time across the entire command.
    /// </summary>
    public void SetVirtualizedGroupFocus(IVirtualizedGroupHandler group, int indexInGroup)
    {
        // Clear focus from regular items
        if (objFocusedIndex >= 0)
        {
            var previousIndex = objFocusedIndex;
            objFocusedIndex = -1;
            OnFocusChanged?.Invoke(previousIndex, -1);
        }

        // Find the group index and set it
        var groupIndex = objVirtualizedGroups.IndexOf(group);
        if (groupIndex >= 0)
        {
            objFocusedVirtualizedGroupIndex = groupIndex;
        }

        // Clear focus from all other virtualized groups
        foreach (var otherGroup in objVirtualizedGroups)
        {
            if (otherGroup != group && otherGroup.FocusedIndex >= 0)
            {
                otherGroup.FocusedIndex = -1;
                otherGroup.NotifyStateChanged();
            }
        }
    }

    /// <summary>
    /// Updates the search query and notifies subscribers.
    /// </summary>
    /// <param name="query">The new search query.</param>
    public void SetSearchQuery(string query)
    {
        if (objSearchQuery != query)
        {
            objSearchQuery = query;
            objFocusedIndex = -1; // Reset focus when search changes
            objFocusedVirtualizedGroupIndex = -1; // Reset virtualized group focus

            // Reset focus in all virtualized groups
            foreach (var group in objVirtualizedGroups)
            {
                group.FocusedIndex = -1;
            }

            OnSearchChanged?.Invoke();
            NotifyStateChanged();
        }
    }

    /// <summary>
    /// Registers an item with the command context.
    /// </summary>
    /// <returns>The index of the registered item.</returns>
    public int RegisterItem(string? value, string? searchText, bool disabled, EventCallback onSelect, string? groupId = null)
    {
        var metadata = new CommandItemMetadata
        {
            Value = value,
            SearchText = searchText ?? value,
            Disabled = disabled,
            OnSelect = onSelect,
            GroupId = groupId
        };
        objItems.Add(metadata);
        objHasRegisteredItems = true;
        NotifyStateChanged(); // Notify so CommandEmpty can update
        return objItems.Count - 1;
    }

    /// <summary>
    /// Updates an existing item's metadata.
    /// </summary>
    public void UpdateItem(int index, string? value, string? searchText, bool disabled, EventCallback onSelect, string? groupId = null)
    {
        if (index >= 0 && index < objItems.Count)
        {
            objItems[index].Value = value;
            objItems[index].SearchText = searchText ?? value;
            objItems[index].Disabled = disabled;
            objItems[index].OnSelect = onSelect;
            objItems[index].GroupId = groupId;
        }
    }

    /// <summary>
    /// Unregisters an item from the command context.
    /// </summary>
    public void UnregisterItem(int index)
    {
        if (index >= 0 && index < objItems.Count)
        {
            objItems[index] = null!; // Mark as null, don't remove to preserve indices
        }
    }

    /// <summary>
    /// Gets the list of filtered items based on the current search query.
    /// </summary>
    public List<CommandItemMetadata> GetFilteredItems()
    {
        if (string.IsNullOrWhiteSpace(objSearchQuery))
        {
            return objItems.Where(i => i != null).ToList();
        }

        if (objFilterFunction != null)
        {
            return objItems.Where(i => i != null && objFilterFunction(i, objSearchQuery)).ToList();
        }

        return objItems
            .Where(i => i != null && (i.SearchText?.Contains(objSearchQuery, StringComparison.OrdinalIgnoreCase) ?? false))
            .ToList();
    }

    /// <summary>
    /// Gets an item by its registration index.
    /// </summary>
    public CommandItemMetadata? GetItemByIndex(int index)
    {
        if (index >= 0 && index < objItems.Count)
        {
            return objItems[index];
        }
        return null;
    }

    /// <summary>
    /// Gets the ID for an item by index.
    /// </summary>
    public string GetItemId(int index) => $"{Id}-item-{index}";

    /// <summary>
    /// Gets whether there are any visible items.
    /// Returns true if no items have been registered yet (to avoid showing "No results" on initial load).
    /// </summary>
    public bool HasVisibleItems()
    {
        // Don't show "No results" until items have had a chance to register
        if (!objHasRegisteredItems)
        {
            return true;
        }

        return GetFilteredItems().Any(i => !i.Disabled);
    }

    /// <summary>
    /// Gets whether a specific group has any visible items.
    /// </summary>
    /// <param name="groupId">The group ID to check.</param>
    /// <returns>True if the group has visible items, false otherwise.</returns>
    public bool GroupHasVisibleItems(string groupId)
    {
        var filteredItems = GetFilteredItems();
        return filteredItems.Any(i => i.GroupId == groupId);
    }

    /// <summary>
    /// Sets the focused index within filtered items and clears virtualized group focus.
    /// </summary>
    public void SetFocusedIndex(int index)
    {
        if (objFocusedIndex != index)
        {
            var previousIndex = objFocusedIndex;
            objFocusedIndex = index;

            // Clear focus from all virtualized groups when focusing a regular item
            if (index >= 0)
            {
                objFocusedVirtualizedGroupIndex = -1;
                foreach (var group in objVirtualizedGroups)
                {
                    if (group.FocusedIndex >= 0)
                    {
                        group.FocusedIndex = -1;
                        group.NotifyStateChanged();
                    }
                }
            }

            // Use targeted focus notification instead of global state change
            OnFocusChanged?.Invoke(previousIndex, index);
        }
    }

    /// <summary>
    /// Moves focus to the next/previous item, including virtualized groups.
    /// </summary>
    /// <param name="direction">1 for next, -1 for previous.</param>
    public async Task MoveFocusAsync(int direction)
    {
        // Suppress mouse hover while keyboard navigating
        if (!objIsKeyboardNavigating)
        {
            objIsKeyboardNavigating = true;
            OnKeyboardNavigationChanged?.Invoke(true);
        }

        var allFiltered = GetFilteredItems();
        var enabledFilteredItems = allFiltered.Where(i => !i.Disabled).ToList();

        // Get virtualized groups that have visible items
        var activeVirtualizedGroups = objVirtualizedGroups.Where(g => g.VisibleItemCount > 0).ToList();

        // Calculate total navigable items
        var totalRegularItems = allFiltered.Count;
        var totalVirtualizedItems = activeVirtualizedGroups.Sum(g => g.VisibleItemCount);

        if (enabledFilteredItems.Count == 0 && totalVirtualizedItems == 0)
        {
            return;
        }

        // Currently in a virtualized group?
        if (objFocusedVirtualizedGroupIndex >= 0)
        {
            // Validate the index is still valid (groups may have changed due to filtering)
            if (objFocusedVirtualizedGroupIndex >= activeVirtualizedGroups.Count)
            {
                objFocusedVirtualizedGroupIndex = -1;
                // Fall through to regular items handling
            }
            else
            {
                var currentGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                var currentIndexInGroup = currentGroup.FocusedIndex;
                var newIndexInGroup = currentIndexInGroup + direction;

                if (newIndexInGroup >= 0 && newIndexInGroup < currentGroup.VisibleItemCount)
                {
                    // Stay within current group
                    currentGroup.FocusedIndex = newIndexInGroup;
                    currentGroup.NotifyStateChanged();
                    return;
                }
                else if (direction > 0)
                {
                    // Moving forward - try next virtualized group or wrap to regular items
                    currentGroup.FocusedIndex = -1;
                    currentGroup.NotifyStateChanged();

                    if (objFocusedVirtualizedGroupIndex + 1 < activeVirtualizedGroups.Count)
                    {
                        // Move to next virtualized group
                        objFocusedVirtualizedGroupIndex++;
                        var nextGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                        // Use ScrollToIndexAsync for consistency
                        await nextGroup.ScrollToIndexAsync(0).ConfigureAwait(false);
                    }
                    else
                    {
                        // Wrap to first regular item (or first virtualized group if no regular items)
                        objFocusedVirtualizedGroupIndex = -1;
                        if (enabledFilteredItems.Count > 0)
                        {
                            FocusFirstRegularItem();
                        }
                        else if (activeVirtualizedGroups.Count > 0)
                        {
                            // No regular items, wrap to first virtualized group
                            objFocusedVirtualizedGroupIndex = 0;
                            var firstGroup = activeVirtualizedGroups[0];
                            // Use ScrollToIndexAsync to ensure scroll position is updated
                            await firstGroup.ScrollToIndexAsync(0).ConfigureAwait(false);
                        }
                    }
                    return;
                }
                else
                {
                    // Moving backward - try previous virtualized group or go to regular items
                    currentGroup.FocusedIndex = -1;
                    currentGroup.NotifyStateChanged();

                    if (objFocusedVirtualizedGroupIndex > 0)
                    {
                        // Move to previous virtualized group (last item)
                        objFocusedVirtualizedGroupIndex--;
                        var prevGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                        // Use ScrollToIndexAsync for potentially unloaded items
                        await prevGroup.ScrollToIndexAsync(prevGroup.VisibleItemCount - 1).ConfigureAwait(false);
                    }
                    else
                    {
                        // Move to last regular item (or last virtualized group if no regular items)
                        objFocusedVirtualizedGroupIndex = -1;
                        if (enabledFilteredItems.Count > 0)
                        {
                            FocusLastRegularItem();
                        }
                        else if (activeVirtualizedGroups.Count > 0)
                        {
                            // No regular items, wrap to last virtualized group
                            objFocusedVirtualizedGroupIndex = activeVirtualizedGroups.Count - 1;
                            var lastGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                            // Use ScrollToIndexAsync for potentially unloaded items
                            await lastGroup.ScrollToIndexAsync(lastGroup.VisibleItemCount - 1).ConfigureAwait(false);
                        }
                    }
                    return;
                }
            }
        }

        // Currently in regular items
        var currentIndex = objFocusedIndex;
        var newIndex = currentIndex + direction;

        if (direction > 0)
        {
            // Moving forward
            if (newIndex >= totalRegularItems)
            {
                // Move to first virtualized group if available
                if (activeVirtualizedGroups.Count > 0)
                {
                    var previousIndex = objFocusedIndex;
                    objFocusedIndex = -1;
                    OnFocusChanged?.Invoke(previousIndex, -1);

                    objFocusedVirtualizedGroupIndex = 0;
                    var firstGroup = activeVirtualizedGroups[0];
                    // Use ScrollToIndexAsync to ensure scroll position is updated
                    await firstGroup.ScrollToIndexAsync(0).ConfigureAwait(false);
                    return;
                }
                else
                {
                    // Wrap to first regular item
                    newIndex = 0;
                }
            }

            // Skip disabled items
            while (newIndex < totalRegularItems && allFiltered[newIndex].Disabled)
            {
                newIndex++;
            }

            if (newIndex >= totalRegularItems)
            {
                // All remaining items disabled, move to virtualized groups
                if (activeVirtualizedGroups.Count > 0)
                {
                    var previousIndex = objFocusedIndex;
                    objFocusedIndex = -1;
                    OnFocusChanged?.Invoke(previousIndex, -1);

                    objFocusedVirtualizedGroupIndex = 0;
                    var firstGroup = activeVirtualizedGroups[0];
                    // Use ScrollToIndexAsync to ensure scroll position is updated
                    await firstGroup.ScrollToIndexAsync(0).ConfigureAwait(false);
                    return;
                }
                newIndex = 0;
                while (newIndex < totalRegularItems && allFiltered[newIndex].Disabled)
                {
                    newIndex++;
                }
            }
        }
        else
        {
            // Moving backward
            if (newIndex < 0)
            {
                // Move to last virtualized group if available
                if (activeVirtualizedGroups.Count > 0)
                {
                    var previousIndex = objFocusedIndex;
                    objFocusedIndex = -1;
                    OnFocusChanged?.Invoke(previousIndex, -1);

                    objFocusedVirtualizedGroupIndex = activeVirtualizedGroups.Count - 1;
                    var lastGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                    // Use ScrollToIndexAsync for potentially unloaded items
                    await lastGroup.ScrollToIndexAsync(lastGroup.VisibleItemCount - 1).ConfigureAwait(false);
                    return;
                }
                else
                {
                    // Wrap to last regular item
                    newIndex = totalRegularItems - 1;
                }
            }

            // Skip disabled items
            while (newIndex >= 0 && allFiltered[newIndex].Disabled)
            {
                newIndex--;
            }

            if (newIndex < 0)
            {
                // All preceding items disabled, move to virtualized groups
                if (activeVirtualizedGroups.Count > 0)
                {
                    var previousIndex = objFocusedIndex;
                    objFocusedIndex = -1;
                    OnFocusChanged?.Invoke(previousIndex, -1);

                    objFocusedVirtualizedGroupIndex = activeVirtualizedGroups.Count - 1;
                    var lastGroup = activeVirtualizedGroups[objFocusedVirtualizedGroupIndex];
                    // Use ScrollToIndexAsync for potentially unloaded items
                    await lastGroup.ScrollToIndexAsync(lastGroup.VisibleItemCount - 1).ConfigureAwait(false);
                    return;
                }
                newIndex = totalRegularItems - 1;
                while (newIndex >= 0 && allFiltered[newIndex].Disabled)
                {
                    newIndex--;
                }
            }
        }

        if (newIndex >= 0 && newIndex < totalRegularItems)
        {
            SetFocusedIndex(newIndex);
        }
    }

    private void FocusFirstRegularItem()
    {
        var allFiltered = GetFilteredItems();
        for (var i = 0; i < allFiltered.Count; i++)
        {
            if (!allFiltered[i].Disabled)
            {
                SetFocusedIndex(i);
                return;
            }
        }
    }

    private void FocusLastRegularItem()
    {
        var allFiltered = GetFilteredItems();
        for (var i = allFiltered.Count - 1; i >= 0; i--)
        {
            if (!allFiltered[i].Disabled)
            {
                SetFocusedIndex(i);
                return;
            }
        }
    }

    /// <summary>
    /// Moves focus to the first enabled item (regular items first, then virtualized groups).
    /// </summary>
    public async Task FocusFirstAsync()
    {
        // Suppress mouse hover while keyboard navigating
        if (!objIsKeyboardNavigating)
        {
            objIsKeyboardNavigating = true;
            OnKeyboardNavigationChanged?.Invoke(true);
        }

        // First try regular items
        var filteredItems = GetFilteredItems();
        for (var i = 0; i < filteredItems.Count; i++)
        {
            if (!filteredItems[i].Disabled)
            {
                // Clear virtualized group focus
                ClearVirtualizedGroupFocus();
                SetFocusedIndex(i);
                return;
            }
        }

        // Then try first virtualized group
        var activeGroups = objVirtualizedGroups.Where(g => g.VisibleItemCount > 0).ToList();
        if (activeGroups.Count > 0)
        {
            ClearVirtualizedGroupFocus();
            objFocusedVirtualizedGroupIndex = 0;
            await activeGroups[0].ScrollToIndexAsync(0).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Moves focus to the last enabled item (last virtualized group first, then regular items).
    /// </summary>
    public async Task FocusLastAsync()
    {
        // Suppress mouse hover while keyboard navigating
        if (!objIsKeyboardNavigating)
        {
            objIsKeyboardNavigating = true;
            OnKeyboardNavigationChanged?.Invoke(true);
        }

        // First try last virtualized group
        var activeGroups = objVirtualizedGroups.Where(g => g.VisibleItemCount > 0).ToList();
        if (activeGroups.Count > 0)
        {
            ClearVirtualizedGroupFocus();
            objFocusedVirtualizedGroupIndex = activeGroups.Count - 1;
            var lastGroup = activeGroups[objFocusedVirtualizedGroupIndex];
            await lastGroup.ScrollToIndexAsync(lastGroup.VisibleItemCount - 1).ConfigureAwait(false);
            return;
        }

        // Then try regular items
        var filteredItems = GetFilteredItems();
        for (var i = filteredItems.Count - 1; i >= 0; i--)
        {
            if (!filteredItems[i].Disabled)
            {
                SetFocusedIndex(i);
                return;
            }
        }
    }

    /// <summary>
    /// Clears focus from all virtualized groups.
    /// </summary>
    private void ClearVirtualizedGroupFocus()
    {
        foreach (var group in objVirtualizedGroups)
        {
            if (group.FocusedIndex >= 0)
            {
                group.FocusedIndex = -1;
                group.NotifyStateChanged();
            }
        }
    }

    /// <summary>
    /// Selects the currently focused item (regular or virtualized).
    /// </summary>
    public async Task SelectFocusedItemAsync()
    {
        // Check if focus is in a virtualized group
        if (objFocusedVirtualizedGroupIndex >= 0)
        {
            var activeGroups = objVirtualizedGroups.Where(g => g.VisibleItemCount > 0).ToList();
            if (objFocusedVirtualizedGroupIndex < activeGroups.Count)
            {
                await activeGroups[objFocusedVirtualizedGroupIndex].SelectFocusedItemAsync().ConfigureAwait(false);
                return;
            }
        }

        // Regular item selection
        var filteredItems = GetFilteredItems();
        if (objFocusedIndex >= 0 && objFocusedIndex < filteredItems.Count)
        {
            var item = filteredItems[objFocusedIndex];
            if (!item.Disabled)
            {
                await SelectItemAsync(item).ConfigureAwait(false);
            }
        }
    }

    /// <summary>
    /// Selects an item by its value.
    /// </summary>
    public async Task SelectItemByValueAsync(string value)
    {
        var item = objItems.FirstOrDefault(i => i != null && i.Value == value);
        if (item != null && !item.Disabled)
        {
            await SelectItemAsync(item).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Selects an item and invokes callbacks.
    /// </summary>
    private async Task SelectItemAsync(CommandItemMetadata item)
    {
        if (item.OnSelect.HasDelegate)
        {
            await item.OnSelect.InvokeAsync().ConfigureAwait(false);
        }

        if (OnValueChange.HasDelegate)
        {
            await OnValueChange.InvokeAsync(item.Value).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Notifies subscribers that the state has changed.
    /// </summary>
    private void NotifyStateChanged() =>
        OnStateChanged?.Invoke();
}
