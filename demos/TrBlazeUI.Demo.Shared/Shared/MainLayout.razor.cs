using TrBlazeUI.Components.Sidebar;
using TrBlazeUI.Demo.Services;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Demo.Shared;

public partial class MainLayout : LayoutComponentBase, IDisposable
{
    [Inject]
    private CollapsibleStateService StateService { get; set; } = null!;

    [Inject]
    private LayoutService LayoutService { get; set; } = null!;

    // Layout mode
    private bool objIsHorizontal;

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

    // Navigation items
    private static readonly List<SidebarNavItem> PrimitivesItems =
    [
        new("primitives/accordion", "Accordion"),
        new("primitives/checkbox", "Checkbox"),
        new("primitives/collapsible", "Collapsible"),
        new("primitives/dialog", "Dialog"),
        new("primitives/dropdown-menu", "Dropdown Menu"),
        new("primitives/hovercard", "Hover Card"),
        new("primitives/label", "Label"),
        new("primitives/popover", "Popover"),
        new("primitives/radio-group", "Radio Group"),
        new("primitives/select", "Select"),
        new("primitives/sheet", "Sheet"),
        new("primitives/switch", "Switch"),
        new("primitives/table", "Table"),
        new("primitives/tabs", "Tabs"),
        new("primitives/tooltip", "Tooltip"),
    ];

    private static readonly List<SidebarNavItem> ComponentsItems =
    [
        new("components/accordion", "Accordion"),
        new("components/alert", "Alert"),
        new("components/alert-dialog", "Alert Dialog"),
        new("components/aspect-ratio", "Aspect Ratio"),
        new("components/avatar", "Avatar"),
        new("components/badge", "Badge"),
        new("components/breadcrumb", "Breadcrumb"),
        new("components/button", "Button"),
        new("components/button-group", "Button Group"),
        new("components/calendar", "Calendar"),
        new("components/card", "Card"),
        new("components/carousel", "Carousel"),
        new("components/checkbox", "Checkbox"),
        new("components/collapsible", "Collapsible"),
        new("components/color-picker", "Color Picker"),
        new("components/combobox", "Combobox"),
        new("components/currency-input", "Currency Input"),
        new("components/command", "Command"),
        new("components/context-menu", "Context Menu"),
        new("components/datatable", "Data Table"),
        new("components/date-picker", "Date Picker"),
        new("components/date-range-picker", "Date Range Picker"),
        new("components/dialog", "Dialog"),
        new("components/dropdown-menu", "Dropdown Menu"),
        new("components/drawer", "Drawer"),
        new("components/empty", "Empty"),
        new("components/field", "Field"),
        new("components/file-upload", "File Upload"),
        new("components/hovercard", "Hover Card"),
        new("components/input", "Input"),
        new("components/input-group", "Input Group"),
        new("components/input-otp", "Input OTP"),
        new("components/item", "Item"),
        new("components/kbd", "Kbd"),
        new("components/label", "Label"),
        new("components/markdown-editor", "Markdown Editor"),
        new("components/masked-input", "Masked Input"),
        new("components/menubar", "Menubar"),
        new("components/multiselect", "Multi Select"),
        new("components/native-select", "Native Select"),
        new("components/navigation-menu", "Navigation Menu"),
        new("components/numeric-input", "Numeric Input"),
        new("components/pagination", "Pagination"),
        new("components/popover", "Popover"),
        new("components/progress", "Progress"),
        new("components/radio-group", "Radio Group"),
        new("components/range-slider", "Range Slider"),
        new("components/rating", "Rating"),
        new("components/resizable", "Resizable"),
        new("components/rich-text-editor", "Rich Text Editor"),
        new("components/scroll-area", "Scroll Area"),
        new("components/select", "Select"),
        new("components/separator", "Separator"),
        new("components/sheet", "Sheet"),
        new("components/sidebar", "Sidebar"),
        new("components/slider", "Slider"),
        new("components/skeleton", "Skeleton"),
        new("components/spinner", "Spinner"),
        new("components/switch", "Switch"),
        new("components/tabs", "Tabs"),
        new("components/textarea", "Textarea"),
        new("components/time-picker", "Time Picker"),
        new("components/toast", "Toast"),
        new("components/toggle", "Toggle"),
        new("components/toggle-group", "Toggle Group"),
        new("components/tooltip", "Tooltip"),
        new("components/typography", "Typography"),
    ];

    private static readonly List<SidebarNavItem> ChartsItems =
    [
        new("charts/area", "Area Chart"),
        new("charts/bar", "Bar Chart"),
        new("charts/line", "Line Chart"),
        new("charts/pie", "Pie Chart"),
        new("charts/radar", "Radar Chart"),
        new("charts/radial", "Radial Chart"),
    ];

    private static readonly List<SidebarNavItem> IconsItems =
    [
        new("icons/lucide", "Lucide Icons"),
        new("icons/heroicons", "Heroicons"),
        new("icons/feather", "Feather Icons"),
    ];

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            // Load layout preference
            await LayoutService.InitializeAsync();
            objIsHorizontal = LayoutService.IsHorizontal;
            LayoutService.OnLayoutChanged += HandleLayoutChanged;

            // Load saved state from localStorage on first render
            objPrimitivesMenuOpen = await StateService.GetStateAsync(PrimitivesMenuKey, defaultValue: false);
            objComponentsMenuOpen = await StateService.GetStateAsync(ComponentsMenuKey, defaultValue: false);
            objChartsMenuOpen = await StateService.GetStateAsync(ChartsMenuKey, defaultValue: false);
            objIconsMenuOpen = await StateService.GetStateAsync(IconsMenuKey, defaultValue: false);

            // Trigger re-render with loaded state
            StateHasChanged();
        }
    }

    private void HandleLayoutChanged()
    {
        objIsHorizontal = LayoutService.IsHorizontal;
        InvokeAsync(StateHasChanged);
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

    public void Dispose()
    {
        LayoutService.OnLayoutChanged -= HandleLayoutChanged;
        GC.SuppressFinalize(this);
    }
}
