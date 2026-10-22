using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Card;

/// <summary>
/// An action area within the card header for buttons, links, or other interactive elements.
/// </summary>
/// <remarks>
/// <para>
/// CardAction provides a dedicated space for action elements like buttons or links
/// within the card header. When placed inside a <see cref="CardHeader"/>, it is
/// positioned at the right edge of the title row by occupying the header's second
/// grid column.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;CardAction&gt;
///     &lt;Button Size="ButtonSize.Small"&gt;Action&lt;/Button&gt;
/// &lt;/CardAction&gt;
/// </code>
/// </example>
public partial class CardAction : ComponentBase
{
    /// <summary>
    /// Gets the cascaded card header context supplied by the parent CardHeader.
    /// </summary>
    [CascadingParameter]
    public CardHeaderContext? HeaderContext { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered in the card action area.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the card action area.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Registers this action with the parent header so the two-column grid is rendered.
    /// </summary>
    protected override void OnInitialized()
    {
        HeaderContext?.RegisterAction();
    }

    /// <summary>
    /// Gets the computed CSS classes for the card action element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Position at the end of the title row when CardHeader renders the two-column grid
        // (Lekhak TR-009). Span both rows so a CardDescription stays in column 1 under the title.
        "col-start-2 row-start-1 row-span-2 self-start justify-self-end flex items-center gap-2 ms-4",
        // Custom classes (if provided)
        Class
    );
}
