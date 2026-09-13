using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Text.Json;

namespace TrBlazeUI.Primitives.Services;

/// <summary>
/// Implementation of positioning service using Floating UI library.
/// </summary>
public class PositioningService : IPositioningService, IAsyncDisposable
{
    private readonly IJSRuntime objJsRuntime;
    private readonly SemaphoreSlim objModuleLock = new(1, 1);
    private IJSObjectReference? objModule;
    private bool objDisposed;

    /// <summary>
    /// Initializes a new instance of the <see cref="PositioningService"/> class.
    /// </summary>
    /// <param name="jsRuntime">The JavaScript runtime for invoking positioning functions.</param>
    public PositioningService(IJSRuntime jsRuntime)
    {
        objJsRuntime = jsRuntime;
    }

    private async Task<IJSObjectReference> GetModuleAsync()
    {
        ObjectDisposedException.ThrowIf(objDisposed, nameof(PositioningService));

        await objModuleLock.WaitAsync().ConfigureAwait(false);
        try
        {
            if (objModule == null)
            {
                objModule = await objJsRuntime.InvokeAsync<IJSObjectReference>(
                    "import", "./_content/TrBlazeUI.Primitives/js/primitives/positioning.js").ConfigureAwait(false);
            }
            return objModule;
        }
        finally
        {
            objModuleLock.Release();
        }
    }

    /// <inheritdoc />
    public async Task<PositionResult> ComputePositionAsync(
        ElementReference reference,
        ElementReference floating,
        PositioningOptions? options = null)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        options ??= new PositioningOptions();

        var jsOptions = new
        {
            placement = options.Placement,
            offset = options.Offset,
            flip = options.Flip,
            shift = options.Shift,
            padding = options.Padding,
            strategy = options.Strategy,
            matchReferenceWidth = options.MatchReferenceWidth
        };

        var result = await module.InvokeAsync<JsonElement>(
            "computePosition", reference, floating, jsOptions).ConfigureAwait(false);

        return new PositionResult
        {
            X = result.GetProperty("x").GetDouble(),
            Y = result.GetProperty("y").GetDouble(),
            Placement = result.GetProperty("placement").GetString() ?? options.Placement,
            TransformOrigin = result.TryGetProperty("transformOrigin", out var origin)
                ? origin.GetString()
                : null,
            Strategy = result.TryGetProperty("strategy", out var strategy)
                ? strategy.GetString() ?? options.Strategy
                : options.Strategy
        };
    }

    /// <inheritdoc />
    public async Task ApplyPositionAsync(ElementReference floating, PositionResult position, bool makeVisible = false)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        await module.InvokeVoidAsync("applyPosition", floating, position, makeVisible).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<IAsyncDisposable> AutoUpdateAsync(
        ElementReference reference,
        ElementReference floating,
        PositioningOptions? options = null)
    {
        var module = await GetModuleAsync().ConfigureAwait(false);
        options ??= new PositioningOptions();

        var jsOptions = new
        {
            placement = options.Placement,
            offset = options.Offset,
            flip = options.Flip,
            shift = options.Shift,
            padding = options.Padding,
            strategy = options.Strategy,
            matchReferenceWidth = options.MatchReferenceWidth
        };

        var cleanup = await module.InvokeAsync<IJSObjectReference>(
            "autoUpdate", reference, floating, jsOptions).ConfigureAwait(false);

        return new AutoUpdateHandle(cleanup);
    }

    /// <summary>
    /// Disposes the positioning service, releasing JavaScript module resources.
    /// </summary>
    public async ValueTask DisposeAsync()
    {
        if (objDisposed)
        {
            return;
        }

        GC.SuppressFinalize(this);
        objDisposed = true;

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

        objModuleLock.Dispose();
    }

    private sealed class AutoUpdateHandle : IAsyncDisposable
    {
        private readonly IJSObjectReference objCleanup;

        public AutoUpdateHandle(IJSObjectReference cleanup)
        {
            objCleanup = cleanup;
        }

        public async ValueTask DisposeAsync()
        {
            try
            {
                await objCleanup.InvokeVoidAsync("apply").ConfigureAwait(false);
            }
            catch
            {
                // Cleanup may already be disposed
            }
        }
    }
}
