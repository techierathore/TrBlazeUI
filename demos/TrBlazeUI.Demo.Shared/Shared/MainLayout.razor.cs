using TrBlazeUI.Demo.Services;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Demo.Shared;

public partial class MainLayout : LayoutComponentBase
{
    [Inject]
    private CollapsibleStateService StateService { get; set; } = null!;

    // State for each collapsible menu section
    private bool objPrimitivesMenuOpen;
    private bool objComponentsMenuOpen;
    private bool objChartsMenuOpen;
    private bool objIconsMenuOpen;

    // State keys for localStorage
    private const string PrimitivesMenuKey = "sidebar-primitives-menu";
    private const string ComponentsMenuKey = "sidebar-components-menu";
    private const string ChartsMenuKey = "sidebar-charts-menu";
    private const string IconsMenuKey = "sidebar-icons-menu";

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            // Load saved state from localStorage on first render
            objPrimitivesMenuOpen = await StateService.GetStateAsync(PrimitivesMenuKey, defaultValue: false);
            objComponentsMenuOpen = await StateService.GetStateAsync(ComponentsMenuKey, defaultValue: false);
            objChartsMenuOpen = await StateService.GetStateAsync(ChartsMenuKey, defaultValue: false);
            objIconsMenuOpen = await StateService.GetStateAsync(IconsMenuKey, defaultValue: false);

            // Trigger re-render with loaded state
            StateHasChanged();
        }
    }

    // Event handlers for state changes
    private async Task OnPrimitivesMenuOpenChanged(bool isOpen)
    {
        objPrimitivesMenuOpen = isOpen;
        await StateService.SetStateAsync(PrimitivesMenuKey, isOpen);
    }

    private async Task OnComponentsMenuOpenChanged(bool isOpen)
    {
        objComponentsMenuOpen = isOpen;
        await StateService.SetStateAsync(ComponentsMenuKey, isOpen);
    }

    private async Task OnChartsMenuOpenChanged(bool isOpen)
    {
        objChartsMenuOpen = isOpen;
        await StateService.SetStateAsync(ChartsMenuKey, isOpen);
    }

    private async Task OnIconsMenuOpenChanged(bool isOpen)
    {
        objIconsMenuOpen = isOpen;
        await StateService.SetStateAsync(IconsMenuKey, isOpen);
    }
}
