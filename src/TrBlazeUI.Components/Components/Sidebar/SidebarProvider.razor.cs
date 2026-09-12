using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Sidebar;

/// <summary>
/// Provides the shared <see cref="SidebarContext"/> to descendant sidebar components, managing
/// open/collapsed state, mobile detection, keyboard shortcuts, and optional cookie persistence.
/// </summary>
public partial class SidebarProvider
{
    private SidebarContext Context { get; set; } = new();
    private IJSObjectReference? objModule;
    private DotNetObjectReference<SidebarProvider>? objDotNetRef;

    [Inject]
    private IJSRuntime JSRuntime { get; set; } = default!;

    /// <summary>
    /// Reacts to (re)assigned parameters by propagating the current <see cref="Variant"/> and
    /// <see cref="Side"/> values into the shared <see cref="SidebarContext"/>.
    /// </summary>
    protected override void OnParametersSet()
    {
        // Update context when parameters change
        Context.SetVariant(Variant);
        Context.SetSide(Side);

        // The phone menu is a portalled Sheet under <body>, so it cannot inherit the custom
        // property this component declares on its own element - it travels by context instead
        // and Sidebar puts it on the sheet itself (TfLens TR-035).
        Context.MobileWidth = MobileWidth;
    }

    /// <summary>
    /// On the first render, imports the sidebar JavaScript module, restores any persisted open state
    /// from the cookie, initializes the context, wires up mobile detection and keyboard shortcuts,
    /// and subscribes to state changes for persistence.
    /// </summary>
    /// <param name="firstRender">True on the first render of the component; otherwise false.</param>
    /// <returns>A task that represents the asynchronous post-render operation.</returns>
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

    /// <summary>
    /// Gets or sets additional HTML attributes (id, style, data-*, aria-*, event handlers)
    /// forwarded to the rendered root element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
