using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Badge;

/// <summary>
/// A badge component that displays a small count or label.
/// </summary>
/// <remarks>
/// <para>
/// The Badge component provides a compact way to display status, notifications counts,
/// or labels. It follows the shadcn/ui design system with multiple visual variants.
/// </para>
/// <para>
/// Features:
/// - 7 visual variants (Default, Secondary, Destructive, Outline, Success, Info, Warning)
/// - Compact, inline-friendly design
/// - Accessible with semantic HTML
/// - RTL (Right-to-Left) support
/// - Dark mode compatible via CSS variables
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;Badge Variant="BadgeVariant.Default"&gt;New&lt;/Badge&gt;
///
/// &lt;Badge Variant="BadgeVariant.Destructive"&gt;5&lt;/Badge&gt;
/// </code>
/// </example>
public partial class Badge : ComponentBase
{
    /// <summary>
    /// Gets or sets the visual style variant of the badge.
    /// </summary>
    /// <remarks>
    /// Controls the color scheme and visual appearance using CSS custom properties.
    /// Default value is <see cref="BadgeVariant.Default"/>.
    /// </remarks>
    [Parameter]
    public BadgeVariant Variant { get; set; } = BadgeVariant.Default;

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the badge.
    /// </summary>
    /// <remarks>
    /// Custom classes are appended after the component's base classes,
    /// allowing for style overrides and extensions.
    /// </remarks>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered inside the badge.
    /// </summary>
    /// <remarks>
    /// Typically contains short text (1-2 words) or a small number.
    /// For accessibility, ensure the content is meaningful.
    /// </remarks>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets the HTML element the badge renders.
    /// </summary>
    /// <remarks>
    /// <para>
    /// <c>"span"</c> (the default) or <c>"div"</c>; any other value falls back to <c>"span"</c>.
    /// A pill is an inline object — it sits inside a sentence, and a <c>&lt;div&gt;</c> cannot sit
    /// inside a <c>&lt;p&gt;</c> without producing invalid HTML. The badge used to be a
    /// <c>&lt;div&gt;</c> always, so a design that draws its pills as <c>&lt;span&gt;</c> could
    /// never be matched element for element (TfLens TR-034). shadcn/ui's own Badge moved to
    /// <c>&lt;span&gt;</c> for the same reason.
    /// </para>
    /// <para>
    /// <b>Behaviour change.</b> The rendered element is now a <c>&lt;span&gt;</c> by default.
    /// It is still <c>inline-flex</c>, so nothing about the appearance changes; set
    /// <c>As="div"</c> where a selector, a test or a stylesheet depends on the old tag.
    /// </para>
    /// </remarks>
    [Parameter]
    public string As { get; set; } = "span";

    /// <summary>
    /// Gets or sets whether a label too long for one line wraps inside a pill that grows with it.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Default <c>false</c>: the label is held on one line. A multi-word label used to wrap while
    /// the pill kept its <c>rounded-full</c> geometry, so at a phone width the end caps became
    /// deep half-ellipses that cut into the first and last lines and the badge read as two
    /// overlapping shapes (TfLens TR-029). Set this to <c>true</c> for a pill that wraps properly:
    /// the text is left-aligned and the radius drops to a corner radius the taller box can carry.
    /// </para>
    /// <para>
    /// <b>Behaviour change.</b> A long label no longer wraps by default — it overflows its
    /// container instead, which is visible rather than silent. Set <c>Wrap</c> or
    /// <see cref="Truncate"/> to say which of the two a given badge should get.
    /// </para>
    /// </remarks>
    [Parameter]
    public bool Wrap { get; set; }

    /// <summary>
    /// Gets or sets whether a label too long for its space is clipped with an ellipsis.
    /// </summary>
    /// <remarks>
    /// Mutually exclusive with <see cref="Wrap"/>; when both are set, <c>Truncate</c> wins, since
    /// it is the more specific instruction. Ignored for content that is not text.
    /// </remarks>
    [Parameter]
    public bool Truncate { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets whether the badge renders a div rather than the default span.
    /// </summary>
    private bool RenderAsDiv =>
        string.Equals(As, "div", StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Gets the classes that decide what a label too long for one line does.
    /// </summary>
    private string OverflowClass =>
        Truncate ? "max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
        : Wrap ? "whitespace-normal break-words text-start rounded-md"
        : "whitespace-nowrap";

    /// <summary>
    /// Gets the computed CSS classes for the badge element.
    /// </summary>
    /// <remarks>
    /// Combines:
    /// - Base badge styles (inline-flex, rounded, border, font)
    /// - Variant-specific classes (colors, backgrounds)
    /// - Custom classes from the Class parameter
    /// Uses the cn() utility for intelligent class merging and Tailwind conflict resolution.
    /// </remarks>
    private string CssClass => ClassNames.cn(
        // Base badge styles (from shadcn/ui)
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Variant-specific styles
        Variant switch
        {
            BadgeVariant.Default => "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            BadgeVariant.Secondary => "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            BadgeVariant.Destructive => "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            BadgeVariant.Outline => "text-foreground",
            // Status variants reuse the Alert palette pairing exactly (tinted --alert-*-bg
            // surface, --alert-*-foreground text, --alert-*/30 border) so a badge and the alert
            // that explains it read as the same status (TR-016).
            // NOT bg-alert-* + text-alert-*-foreground: unlike --destructive-foreground, the
            // --alert-*-foreground tokens are a DARKER shade of the same hue meant for text on
            // the tint, so painting them on the solid fill leaves roughly 1.4:1 contrast.
            // hover:opacity-80 stands in for the /80 colour-mix hover used above; the shipped
            // stylesheet emits no hover:bg-alert-*/80 utility.
            BadgeVariant.Success => "border-alert-success/30 bg-alert-success-bg text-alert-success-foreground hover:opacity-80",
            BadgeVariant.Info => "border-alert-info/30 bg-alert-info-bg text-alert-info-foreground hover:opacity-80",
            BadgeVariant.Warning => "border-alert-warning/30 bg-alert-warning-bg text-alert-warning-foreground hover:opacity-80",
            _ => "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
        },
        // Wrap / truncate treatment. Placed after rounded-full so that Wrap's own rounded-md wins
        // the border-radius group in cn() - a 3-line pill with a 9999px radius is the TR-029 shape.
        OverflowClass,
        // Custom classes (if provided)
        Class
    );
}
