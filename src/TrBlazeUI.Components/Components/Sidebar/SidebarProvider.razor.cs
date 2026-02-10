using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Sidebar;

public partial class SidebarProvider
{
    private SidebarContext Context { get; set; } = new();
    private IJSObjectReference? objModule;
    private DotNetObjectReference<SidebarProvider>? objDotNetRef;

    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    protected override void OnParametersSet()
    {
        // Update context when parameters change
        Context.SetVariant(Variant);
        Context.SetSide(Side);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            try
            {
                // Load the sidebar JavaScript module
                objModule = await JSRuntime.InvokeAsync<IJSObjectReference>(
                    "import", "./_content/TrBlazeUI.Components/js/sidebar.js");

                // Create a reference to this component for JS callbacks
                objDotNetRef = DotNetObjectReference.Create(this);

                // Initialize sidebar state from cookie if persistence is enabled
                bool? savedOpen = null;
                if (!string.IsNullOrEmpty(CookieKey))
                {
                    savedOpen = await objModule.InvokeAsync<bool?>("getSidebarState", CookieKey);
                }

                // Initialize context with saved state or defaults
                Context.Initialize(
                    open: savedOpen ?? DefaultOpen,
                    variant: Variant,
                    side: Side
                );

                // Set up mobile detection and keyboard shortcuts
                await objModule.InvokeVoidAsync("initializeSidebar", objDotNetRef, CookieKey);

                // Subscribe to state changes for persistence
                Context.StateChanged += OnStateChanged;

                StateHasChanged();
            }
            catch (JSException)
            {
                // JS module not available, continue without JS features
                Context.Initialize(open: DefaultOpen, variant: Variant, side: Side);
                StateHasChanged();
            }
        }
    }

    private async void OnStateChanged(object? sender, EventArgs e)
    {
        // Persist sidebar state to cookie when it changes
        if (objModule != null && !string.IsNullOrEmpty(CookieKey))
        {
            try
            {
                await objModule.InvokeVoidAsync("saveSidebarState", CookieKey, Context.Open);
            }
            catch (JSException)
            {
                // Ignore persistence errors
            }
        }

        // Notify UI of state change
        await InvokeAsync(StateHasChanged);
    }

    /// <summary>
    /// Called from JavaScript when mobile state changes.
    /// </summary>
    [JSInvokable]
    public void OnMobileChange(bool isMobile) =>
        Context.SetIsMobile(isMobile);

    /// <summary>
    /// Called from JavaScript when keyboard shortcut (Ctrl/Cmd + B) is pressed.
    /// </summary>
    [JSInvokable]
    public void OnToggleShortcut()
    {
        Context.ToggleSidebar();
        StateHasChanged(); // Force re-render after toggle
    }

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
