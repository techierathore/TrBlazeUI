using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.ResponsiveNav;

/// <summary>
/// Provides the shared <see cref="ResponsiveNavContext"/> to descendant responsive navigation
/// components, managing mobile detection through JS interop and notifying subscribers of state changes.
/// </summary>
public partial class ResponsiveNavProvider
{
    private ResponsiveNavContext Context { get; set; } = new();
    private IJSObjectReference? objModule;
    private DotNetObjectReference<ResponsiveNavProvider>? objDotNetRef;

    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    /// <summary>
    /// On the first render, imports the responsive navigation JavaScript module, initializes mobile
    /// detection, and subscribes to context state changes so the UI re-renders when the layout changes.
    /// </summary>
    /// <param name="firstRender">True on the first render of the component; otherwise false.</param>
    /// <returns>A task that represents the asynchronous post-render operation.</returns>
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            try
            {
                // Load the responsive nav JavaScript module
                objModule = await JSRuntime.InvokeAsync<IJSObjectReference>(
                    "import", "./_content/TrBlazeUI.Components/js/responsive-nav.js");

                // Create a reference to this component for JS callbacks
                objDotNetRef = DotNetObjectReference.Create(this);

                // Initialize mobile detection
                await objModule.InvokeVoidAsync("initialize", objDotNetRef);

                // Subscribe to state changes
                Context.StateChanged += OnStateChanged;

                StateHasChanged();
            }
            catch (JSException)
            {
                // JS module not available, continue without JS features
                StateHasChanged();
            }
        }
    }

    private async void OnStateChanged(object? sender, EventArgs e) =>
        // Notify UI of state change
        await InvokeAsync(StateHasChanged);

    /// <summary>
    /// Called from JavaScript when mobile state changes.
    /// </summary>
    [JSInvokable]
    public void OnMobileChange(bool isMobile) =>
        Context.SetIsMobile(isMobile);

    /// <summary>
    /// Asynchronously disposes the provider, unsubscribing from context state changes and releasing
    /// the JavaScript module and .NET object references.
    /// </summary>
    /// <returns>A task that represents the asynchronous dispose operation.</returns>
    public async ValueTask DisposeAsync()
    {
        if (Context != null)
        {
            Context.StateChanged -= OnStateChanged;
        }

        if (objModule != null)
        {
            try
            {
                await objModule.InvokeVoidAsync("cleanup");
                await objModule.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Circuit disconnected, ignore
            }
        }

        objDotNetRef?.Dispose();

        GC.SuppressFinalize(this);
    }
}
