using TrBlazeUI.Primitives.Utilities;
using Microsoft.JSInterop;

namespace TrBlazeUI.Primitives.Services;

/// <summary>
/// Implementation of keyboard shortcut service using JavaScript interop for global keyboard handling.
/// </summary>
public class KeyboardShortcutService : IKeyboardShortcutService
{
    private readonly IJSRuntime objJsRuntime;
    private readonly Dictionary<string, ShortcutRegistration> objShortcuts = new();
    private readonly SemaphoreSlim objModuleLock = new(1, 1);
    private IJSObjectReference? objModule;
    private DotNetObjectReference<KeyboardShortcutService>? objDotNetRef;
    private bool objSuspended;
    private bool objDisposed;
    private int objRegistrationCounter;

    /// <summary>
    /// Initializes a new instance of the <see cref="KeyboardShortcutService"/> class.
    /// </summary>
    /// <param name="jsRuntime">The JavaScript runtime for invoking keyboard handling functions.</param>
    public KeyboardShortcutService(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    /// <inheritdoc />
    public bool IsSuspended => objSuspended;

    /// <inheritdoc />
    public async Task<IDisposable> RegisterAsync(string shortcut, Func<Task> callback)
    {
        var id = $"shortcut_{Interlocked.Increment(ref objRegistrationCounter)}";
        return await RegisterAsync(shortcut, callback, id).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<IDisposable> RegisterAsync(string shortcut, Func<Task> callback, string id)
    {
        ObjectDisposedException.ThrowIf(objDisposed, nameof(KeyboardShortcutService));

        var parsed = KeyboardShortcut.Parse(shortcut);
        var normalizedKey = parsed.GetNormalizedKey();

        await EnsureInitializedAsync().ConfigureAwait(false);

        // Register with the service
        var registration = new ShortcutRegistration(id, parsed, callback);
        objShortcuts[normalizedKey] = registration;

        // Register with JavaScript
        if (objModule != null)
        {
            await objModule.InvokeVoidAsync("registerShortcut", normalizedKey).ConfigureAwait(false);
        }

        return new ShortcutHandle(this, normalizedKey, id);
    }

    /// <inheritdoc />
    public void Unregister(string id)
    {
        var toRemove = objShortcuts.FirstOrDefault(kvp => kvp.Value.Id == id);
        if (toRemove.Key != null)
        {
            UnregisterInternal(toRemove.Key);
        }
    }

    /// <inheritdoc />
    public void Suspend() => objSuspended = true;

    /// <inheritdoc />
    public void Resume() => objSuspended = false;

    /// <summary>
    /// Called from JavaScript when a registered shortcut key is pressed.
    /// </summary>
    /// <param name="normalizedKey">The normalized key combination (e.g., "ctrl+n").</param>
    [JSInvokable]
    public async Task HandleShortcutAsync(string normalizedKey)
    {
        if (objSuspended || objDisposed)
        {
            return;
        }

        // Input validation - reject obviously invalid inputs
        if (string.IsNullOrWhiteSpace(normalizedKey) || normalizedKey.Length > 50)
        {
            return;
        }

        if (objShortcuts.TryGetValue(normalizedKey, out var registration))
        {
            try
            {
                await registration.Callback().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                // Log or handle exception - don't let it propagate to JS
                Console.Error.WriteLine($"Error handling keyboard shortcut '{normalizedKey}': {ex.Message}");
            }
        }
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        if (objDisposed)
        {
            return;
        }

        GC.SuppressFinalize(this);
        objDisposed = true;
        objShortcuts.Clear();

        if (objModule != null)
        {
            try
            {
                await objModule.InvokeVoidAsync("dispose").ConfigureAwait(false);
                await objModule.DisposeAsync().ConfigureAwait(false);
            }
            catch
            {
                // Module may already be disposed (e.g., during page navigation)
            }
        }

        objDotNetRef?.Dispose();
        objModuleLock.Dispose();
    }

    private async Task EnsureInitializedAsync()
    {
        if (objModule != null)
        {
            return;
        }

        await objModuleLock.WaitAsync().ConfigureAwait(false);
        try
        {
            if (objModule == null)
            {
                objDotNetRef = DotNetObjectReference.Create(this);
                objModule = await objJsRuntime.InvokeAsync<IJSObjectReference>(
                    "import", "./_content/TrBlazeUI.Primitives/js/primitives/keyboard-shortcuts.js").ConfigureAwait(false);
                await objModule.InvokeVoidAsync("initialize", objDotNetRef).ConfigureAwait(false);
            }
        }
        finally
        {
            objModuleLock.Release();
        }
    }

    private void UnregisterInternal(string normalizedKey)
    {
        if (objShortcuts.Remove(normalizedKey) && objModule != null)
        {
            // Fire-and-forget unregister from JS
            _ = objModule.InvokeVoidAsync("unregisterShortcut", normalizedKey).AsTask();
        }
    }

    private sealed class ShortcutRegistration
    {
        public string Id { get; }
        public KeyboardShortcut Shortcut { get; }
        public Func<Task> Callback { get; }

        public ShortcutRegistration(string id, KeyboardShortcut shortcut, Func<Task> callback)
        {
            Id = id;
            Shortcut = shortcut;
            Callback = callback;
        }
    }

    private sealed class ShortcutHandle : IDisposable
    {
        private readonly KeyboardShortcutService objService;
        private readonly string objNormalizedKey;
        private readonly string objId;
        private bool objDisposed;

        public ShortcutHandle(KeyboardShortcutService service, string normalizedKey, string id)
        {
            objService = service;
            objNormalizedKey = normalizedKey;
            objId = id;
        }

        public void Dispose()
        {
            if (objDisposed)
            {
                return;
            }

            objDisposed = true;

            if (!objService.objDisposed)
            {
                objService.UnregisterInternal(objNormalizedKey);
            }
        }
    }
}
