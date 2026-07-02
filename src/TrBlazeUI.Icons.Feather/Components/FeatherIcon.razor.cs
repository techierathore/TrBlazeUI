using System.Collections.Concurrent;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using TrBlazeUI.Icons.Feather.Data;

namespace TrBlazeUI.Icons.Feather.Components;

/// <summary>
/// A Blazor component for rendering Feather SVG icons.
/// Feather icons are minimalist, stroke-based icons at 24x24 with 2px strokes.
/// </summary>
public partial class FeatherIcon : ComponentBase
{
    /// <summary>
    /// The name of the icon to render (case-insensitive).
    /// Example: "camera", "home", "user"
    /// </summary>
    [Parameter, EditorRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The size of the icon in pixels.
    /// Default is 24 (Feather icons are designed at 24x24).
    /// </summary>
    [Parameter]
    public int Size { get; set; } = 24;

    /// <summary>
    /// The color of the icon. Supports CSS color values.
    /// Default is "currentColor" (inherits from parent).
    /// Examples: "red", "#FF0000", "var(--primary)", "rgb(255, 0, 0)"
    /// </summary>
    [Parameter]
    public string Color { get; set; } = "currentColor";

    /// <summary>
    /// The stroke width for the icon.
    /// Default is 2 (Feather icons design standard).
    /// </summary>
    [Parameter]
    public double StrokeWidth { get; set; } = 2.0;

    /// <summary>
    /// Additional CSS classes to apply to the icon.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// ARIA label for accessibility (screen readers).
    /// When provided, the icon is exposed as an image with this accessible name
    /// (role="img" + aria-label). When omitted, the icon is treated as decorative
    /// and hidden from assistive technology (aria-hidden="true").
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Additional HTML attributes to apply to the SVG element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// The SVG content for the icon.
    /// Retrieved from FeatherIconData based on Name.
    /// Removes hardcoded stroke attributes to allow the Color parameter to take effect.
    /// </summary>
    private string? SvgContent
    {
        get
        {
            var content = FeatherIconData.GetIcon(Name);
            if (content == null)
            {
                return null;
            }

            // Remove stroke="currentColor" and stroke="..." attributes from the SVG content
            // This allows the outer SVG's stroke attribute (from Color parameter) to take effect
            content = System.Text.RegularExpressions.Regex.Replace(
                content,
                @"\s+stroke=""[^""]*""",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            return content;
        }
    }

    /// <summary>
    /// The combined CSS class string.
    /// </summary>
    private string CssClass => string.IsNullOrEmpty(Class) ? string.Empty : Class;

    /// <summary>
    /// Icon names that have already produced an unknown-name warning, so each
    /// bad id is logged once per application rather than once per render.
    /// </summary>
    private static readonly ConcurrentDictionary<string, byte> WarnedUnknownNames = new();

    /// <summary>
    /// Cached LoggerMessage delegate for the unknown-icon-name warning (CA1848).
    /// </summary>
    private static readonly Action<ILogger, string, Exception?> LogUnknownIconName =
        LoggerMessage.Define<string>(
            LogLevel.Warning,
            new EventId(1, "TrBlazeUIUnknownIconName"),
            "TrBlazeUI FeatherIcon: unknown icon name '{IconName}'. An empty placeholder is rendered instead. " +
            "Check the Feather icon id (e.g. 'plus' not 'add', 'lock' not 'lockclosed').");

    [Inject]
    private ILogger<FeatherIcon> Logger { get; set; } = default!;

    /// <summary>
    /// The role attribute for the SVG: "img" when an accessible name is supplied, otherwise none.
    /// </summary>
    private string? IconRole => string.IsNullOrEmpty(AriaLabel) ? null : "img";

    /// <summary>
    /// aria-hidden="true" when the icon is decorative (no accessible name supplied).
    /// </summary>
    private string? AriaHiddenValue => string.IsNullOrEmpty(AriaLabel) ? "true" : null;

    /// <inheritdoc />
    protected override void OnParametersSet()
    {
        if (SvgContent == null && WarnedUnknownNames.TryAdd(Name, 0))
        {
            LogUnknownIconName(Logger, Name, null);
        }
    }
}
