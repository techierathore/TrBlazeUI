using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Chart;

/// <summary>
/// A styled container wrapper for chart components.
/// </summary>
/// <remarks>
/// <para>
/// ChartContainer provides consistent styling and structure for charts including:
/// - Rounded borders and padding matching shadcn/ui Card component
/// - Dark mode compatible background
/// - Flex container for proper chart layout
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;ChartContainer&gt;
///     &lt;BarChart Items="@data" ... /&gt;
/// &lt;/ChartContainer&gt;
/// </code>
/// </example>
public partial class ChartContainer : ComponentBase
{
    /// <summary>
    /// Gets or sets the content to display inside the container.
    /// </summary>
    /// <remarks>
    /// Typically contains a chart component (BarChart, LineChart, etc.).
    /// </remarks>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the container.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets whether the container drops its own card chrome.
    /// </summary>
    /// <remarks>
    /// <para>
    /// The container paints a shadcn Card surface — border, card background, shadow and 24px of
    /// padding. Inside a <c>Card</c>, which is where a chart usually goes and where both the AI
    /// reference and the mockups put it, that draws a second bordered panel around the plot: a
    /// card inside a card. Set this to <c>true</c> for a flush chart that takes its surface from
    /// whatever it is placed in (TfLens TR-028).
    /// </para>
    /// <para>
    /// The layout role — the flex column the chart sizes itself against — is kept either way.
    /// </para>
    /// </remarks>
    [Parameter]
    public bool Bare { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the container.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the container.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "flex flex-col",
        Bare ? null : "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
        Class
    );
}
