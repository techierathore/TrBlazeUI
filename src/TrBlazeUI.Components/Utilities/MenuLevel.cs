namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// One list of a menu: the top list of a Menubar menu or ContextMenu, or one submenu below it.
/// It keeps the list's items in order for the arrow keys and which of its submenus is open
/// (Chatur TR-020).
/// </summary>
/// <remarks>
/// At most one submenu is open per list, so opening one closes its sibling. A submenu component
/// subscribes to <see cref="OpenSubChanged"/> and re-renders when it opens or closes.
/// </remarks>
/// <typeparam name="TItem">The menu's item type.</typeparam>
internal sealed class MenuLevel<TItem> where TItem : class
{
    private readonly List<TItem> objItems = new();

    /// <summary>Raised when <see cref="OpenSub"/> changes.</summary>
    internal event Action? OpenSubChanged;

    /// <summary>Gets or sets the position of the focused item in <see cref="Items"/>, or -1.</summary>
    internal int FocusedIndex { get; set; } = -1;

    /// <summary>Gets the submenu of this list that is open, or null.</summary>
    internal object? OpenSub { get; private set; }

    /// <summary>Gets the items of this list in the order they registered.</summary>
    internal List<TItem> Items => objItems;

    /// <summary>Adds an item, once.</summary>
    /// <param name="aItem">The item.</param>
    internal void Register(TItem aItem)
    {
        if (!objItems.Contains(aItem))
        {
            objItems.Add(aItem);
        }
    }

    /// <summary>Removes an item.</summary>
    /// <param name="aItem">The item.</param>
    internal void Unregister(TItem aItem) => objItems.Remove(aItem);

    /// <summary>Opens one submenu of this list, closing any other, or closes all with null.</summary>
    /// <param name="aSub">The submenu to open, or null.</param>
    internal void SetOpenSub(object? aSub)
    {
        if (ReferenceEquals(OpenSub, aSub))
        {
            return;
        }

        OpenSub = aSub;
        OpenSubChanged?.Invoke();
    }

    /// <summary>Forgets a submenu that is going away, without raising the event.</summary>
    /// <param name="aSub">The submenu being disposed.</param>
    internal void Forget(object aSub)
    {
        if (ReferenceEquals(OpenSub, aSub))
        {
            OpenSub = null;
        }
    }

    /// <summary>Clears the focus and the open submenu, as when the menu opens or closes.</summary>
    internal void Reset()
    {
        FocusedIndex = -1;
        OpenSub = null;
    }

    /// <summary>
    /// Works out which enabled item a navigation key moves to and records it as focused.
    /// </summary>
    /// <remarks>
    /// 1. ArrowDown and ArrowUp move one enabled item, wrapping when <paramref name="aLoop"/> is set.
    /// 2. Home and End go to the first and last enabled item.
    /// 3. With nothing focused, ArrowDown starts at the first item and ArrowUp at the last.
    /// </remarks>
    /// <param name="aKey">The key pressed.</param>
    /// <param name="aLoop">Whether to wrap at either end.</param>
    /// <param name="aIsDisabled">Tells a disabled item.</param>
    /// <returns>The item to focus, or null when the key is not a navigation key or nothing is enabled.</returns>
    internal TItem? Move(string aKey, bool aLoop, Func<TItem, bool> aIsDisabled)
    {
        var vEnabled = objItems.Where(aItem => !aIsDisabled(aItem)).ToList();
        if (vEnabled.Count == 0)
        {
            return null;
        }

        var vCurrent = FocusedIndex >= 0 && FocusedIndex < objItems.Count
            ? vEnabled.IndexOf(objItems[FocusedIndex])
            : -1;
        int? vTarget = aKey switch
        {
            "ArrowDown" => NextIndex(vCurrent, vEnabled.Count, aLoop),
            "ArrowUp" => PreviousIndex(vCurrent, vEnabled.Count, aLoop),
            "Home" => 0,
            "End" => vEnabled.Count - 1,
            _ => null
        };
        if (vTarget is null)
        {
            return null;
        }

        var vItem = vEnabled[vTarget.Value];
        FocusedIndex = objItems.IndexOf(vItem);
        return vItem;
    }

    /// <summary>Records an item as focused, as when focus comes back to a submenu trigger.</summary>
    /// <param name="aItem">The item.</param>
    internal void MarkFocused(TItem aItem) => FocusedIndex = objItems.IndexOf(aItem);

    /// <summary>Gets the focused item, or null.</summary>
    internal TItem? Focused => FocusedIndex >= 0 && FocusedIndex < objItems.Count ? objItems[FocusedIndex] : null;

    private static int NextIndex(int aCurrent, int aCount, bool aLoop)
    {
        if (aCurrent == -1)
        {
            return 0;
        }

        return aCurrent == aCount - 1 ? (aLoop ? 0 : aCurrent) : aCurrent + 1;
    }

    private static int PreviousIndex(int aCurrent, int aCount, bool aLoop)
    {
        if (aCurrent == -1)
        {
            return aCount - 1;
        }

        return aCurrent == 0 ? (aLoop ? aCount - 1 : 0) : aCurrent - 1;
    }
}
