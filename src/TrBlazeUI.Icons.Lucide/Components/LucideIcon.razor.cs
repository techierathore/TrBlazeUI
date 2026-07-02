using System.Collections.Concurrent;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using TrBlazeUI.Icons.Lucide.Data;

namespace TrBlazeUI.Icons.Lucide.Components;

/// <summary>
/// Renders a Lucide icon as an inline SVG.
/// Provides a React-style API for easy integration with Blazor applications.
/// </summary>
public partial class LucideIcon : ComponentBase
{
    /// <summary>
    /// The name of the icon to render (e.g., "camera", "home", "user").
    /// Names are case-insensitive.
    /// </summary>
    [Parameter, EditorRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Size of the icon in pixels. Default: 24.
    /// </summary>
    [Parameter]
    public int Size { get; set; } = 24;

    /// <summary>
    /// Color of the icon. Default: "currentColor" (inherits from parent).
    /// Accepts any valid CSS color value (hex, rgb, named colors, CSS variables, etc.).
    /// </summary>
    [Parameter]
    public string Color { get; set; } = "currentColor";

    /// <summary>
    /// Stroke width of the icon paths. Default: 2.0.
    /// Lucide icons are designed with a 2px stroke width.
    /// </summary>
    [Parameter]
    public double StrokeWidth { get; set; } = 2.0;

    /// <summary>
    /// Fill color of the icon. Default: "none" (no fill, stroke only).
    /// Set to "currentColor" to inherit from parent, or any valid CSS color value.
    /// </summary>
    [Parameter]
    public string Fill { get; set; } = "none";

    /// <summary>
    /// Additional CSS classes to apply to the SVG element.
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
    /// Additional SVG attributes (captured unmatched parameters).
    /// Allows passing any valid SVG attribute like data-*, style, etc.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the SVG content for the icon from the LucideIconData dictionary.
    /// Returns null if the icon is not found.
    /// Removes hardcoded stroke and fill attributes to allow parameters to take effect.
    /// </summary>
    private string? SvgContent
    {
        get
        {
            var content = LucideIconData.GetIcon(Name);
            if (content == null)
            {
                return null;
            }

            // Remove stroke="..." attributes from the SVG content
            // This allows the outer SVG's stroke attribute (from Color parameter) to take effect
            content = System.Text.RegularExpressions.Regex.Replace(
                content,
                @"\s+stroke=""[^""]*""",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            // Remove fill="..." attributes from the SVG content
            // This allows the outer SVG's fill attribute (from Fill parameter) to take effect
            content = System.Text.RegularExpressions.Regex.Replace(
                content,
                @"\s+fill=""[^""]*""",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            return content;
        }
    }

    /// <summary>
    /// Builds the CSS class string for the SVG element.
    /// Combines the base "lucide-icon" class with any custom classes.
    /// </summary>
    private string CssClass
    {
        get
        {
            var classes = new List<string> { "lucide-icon" };

            if (!string.IsNullOrWhiteSpace(Class))
            {
                classes.Add(Class);
            }

            return string.Join(" ", classes);
        }
    }

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
            "TrBlazeUI LucideIcon: unknown icon name '{IconName}'. An empty placeholder is rendered instead. " +
            "Check the Lucide icon id.");

    [Inject]
    private ILogger<LucideIcon> Logger { get; set; } = default!;

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
