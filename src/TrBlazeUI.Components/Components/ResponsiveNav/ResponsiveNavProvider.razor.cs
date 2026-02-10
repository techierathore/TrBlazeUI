using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.ResponsiveNav;

public partial class ResponsiveNavProvider
{
    private ResponsiveNavContext Context { get; set; } = new();
    private IJSObjectReference? objModule;
    private DotNetObjectReference<ResponsiveNavProvider>? objDotNetRef;

    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

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
