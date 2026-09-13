using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Primitives.Services;

/// <summary>
/// Implementation of focus management service using JavaScript interop.
/// </summary>
public class FocusManager : IFocusManager, IAsyncDisposable
{
    private readonly IJSRuntime objJsRuntime;
    private IJSObjectReference? objModule;

    /// <summary>
    /// Initializes a new instance of the <see cref="FocusManager"/> class.
    /// </summary>
    /// <param name="jsRuntime">The JavaScript runtime for invoking focus management functions.</param>
    public FocusManager(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        if (objModule == null)
        {
            objModule = await objJsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/TrBlazeUI.Primitives/js/primitives/focus-trap.js").ConfigureAwait(false);
        }
        return objModule;
    }

    /// <inheritdoc />
    public async Task<IAsyncDisposable> TrapFocusAsync(ElementReference container)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        var cleanupFunction = await module.InvokeAsync<IJSObjectReference>("createFocusTrap", container).ConfigureAwait(false);
        return new FocusTrapHandle(cleanupFunction);
    }

    /// <inheritdoc />
    public async Task RestoreFocusAsync(ElementReference? previousElement)
    {
        if (previousElement.HasValue)
        {
            try
            {
                // Use Blazor's built-in FocusAsync instead of eval for security
                await previousElement.Value.FocusAsync().ConfigureAwait(false);
            }
            catch
            {
                // Element may no longer exist, ignore
            }
        }
    }

    /// <inheritdoc />
    public async Task FocusFirstAsync(ElementReference container)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        await module.InvokeVoidAsync("focusFirst", container).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task FocusLastAsync(ElementReference container)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        await module.InvokeVoidAsync("focusLast", container).ConfigureAwait(false);
    }

    /// <summary>
    /// Disposes the focus manager, releasing JavaScript module resources.
    /// </summary>
    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);

        if (objModule != null)
        {
            try
            {
                await objModule.DisposeAsync().ConfigureAwait(false);
            }
            catch (JSDisconnectedException)
            {
                // Circuit already torn down - the module died with it (TfLens TR-036).
            }
        }
    }

    private sealed class FocusTrapHandle : IAsyncDisposable
    {
        private readonly IJSObjectReference objCleanupFunction;

        public FocusTrapHandle(IJSObjectReference cleanupFunction)
        {
            objCleanupFunction = cleanupFunction;
        }

        public async ValueTask DisposeAsync()
        {
            try
            {
                await objCleanupFunction.InvokeVoidAsync("apply").ConfigureAwait(false);
            }
            catch
            {
                // Cleanup function may already be disposed
            }
        }
    }
}
