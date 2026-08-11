using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Primitives.Services;

/// <summary>
/// Implementation of portal rendering service for Blazor.
/// Manages a registry of portals that can be rendered at document body level.
/// </summary>
/// <remarks>
/// Registration order is preserved. Two overlays that share a z-index are ordered by their
/// position in the DOM, so a portal opened later - a dialog raised from inside another dialog,
/// for example - must be rendered after the one it was opened from.
/// </remarks>
public class PortalService : IPortalService
{
    private readonly Lock objSync = new();
    private readonly Dictionary<string, PortalEntry> objPortals = [];
    private long objNextSequence;

    /// <inheritdoc />
    public event Action? OnPortalsChanged;

    /// <inheritdoc />
    public event Action<string>? OnPortalRendered;

    /// <inheritdoc />
    public void NotifyPortalRendered(string portalId) =>
        OnPortalRendered?.Invoke(portalId);

    /// <inheritdoc />
    public void RegisterPortal(string id, RenderFragment content)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Portal ID cannot be null or whitespace.", nameof(id));
        }

        ArgumentNullException.ThrowIfNull(content);

        lock (objSync)
        {
            // A re-registration keeps its original position; only a genuinely new portal is
            // appended, so an already-open dialog does not jump above one opened after it.
            var vSequence = objPortals.TryGetValue(id, out var vExisting)
                ? vExisting.Sequence
                : objNextSequence++;

            objPortals[id] = new PortalEntry(vSequence, content);
        }

        OnPortalsChanged?.Invoke();
    }

    /// <inheritdoc />
    public void UnregisterPortal(string id)
    {
        bool vRemoved;

        lock (objSync)
        {
            vRemoved = objPortals.Remove(id);
        }

        if (vRemoved)
        {
            OnPortalsChanged?.Invoke();
        }
    }

    /// <inheritdoc />
    public void UpdatePortalContent(string id, RenderFragment content)
    {
        ArgumentNullException.ThrowIfNull(content);

        lock (objSync)
        {
            if (!objPortals.TryGetValue(id, out var vExisting))
            {
                throw new InvalidOperationException($"Portal with ID '{id}' is not registered.");
            }

            objPortals[id] = vExisting with { Content = content };
        }

        OnPortalsChanged?.Invoke();
    }

    /// <inheritdoc />
    public void RefreshPortal(string id)
    {
        bool vExists;

        lock (objSync)
        {
            vExists = objPortals.ContainsKey(id);
        }

        if (vExists)
        {
            // Notify PortalHost to re-render WITHOUT replacing the RenderFragment
            // This allows the existing fragment to pick up new captured values
            // without creating new DOM elements (which would break ElementReference)
            OnPortalsChanged?.Invoke();
        }
    }

    /// <inheritdoc />
    public IReadOnlyDictionary<string, RenderFragment> GetPortals()
    {
        lock (objSync)
        {
            return objPortals
                .OrderBy(entry => entry.Value.Sequence)
                .ToDictionary(entry => entry.Key, entry => entry.Value.Content);
        }
    }

    /// <inheritdoc />
    public IReadOnlyList<KeyValuePair<string, RenderFragment>> GetOrderedPortals()
    {
        lock (objSync)
        {
            return objPortals
                .OrderBy(entry => entry.Value.Sequence)
                .Select(entry => new KeyValuePair<string, RenderFragment>(entry.Key, entry.Value.Content))
                .ToList();
        }
    }

    private int objHostCount;

    /// <inheritdoc />
    public bool HasHost => Volatile.Read(ref objHostCount) > 0;

    /// <inheritdoc />
    public void AttachHost() => Interlocked.Increment(ref objHostCount);

    /// <inheritdoc />
    public void DetachHost() => Interlocked.Decrement(ref objHostCount);

    /// <summary>
    /// A registered portal and the order in which it was opened.
    /// </summary>
    /// <param name="Sequence">Monotonically increasing registration order.</param>
    /// <param name="Content">The content rendered by the portal host.</param>
    private sealed record PortalEntry(long Sequence, RenderFragment Content);
}
