using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace TrBlazeUI.Components.Card;

/// <summary>
/// The title heading of a card component.
/// </summary>
/// <remarks>
/// <para>
/// CardTitle displays the main heading within a card header. It renders an <c>h3</c> by default;
/// <see cref="As"/> chooses another element so the page keeps a correct heading outline.
/// </para>
/// <para>
/// Written as a code component rather than markup because Razor cannot take an element name from
/// a parameter; the render is three calls and the classes are unchanged.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;CardTitle&gt;Card Title&lt;/CardTitle&gt;
/// &lt;CardTitle As="h2"&gt;Card Title as the page's second-level heading&lt;/CardTitle&gt;
/// </code>
/// </example>
public class CardTitle : ComponentBase
{
    private const string DefaultElement = "h3";

    /// <summary>
    /// Gets or sets the content to be rendered as the card title.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets the heading element to render, so a page keeps a correct heading outline
    /// (Sevak TR-008). Default <c>h3</c>; any element name is accepted, e.g. <c>h2</c>, <c>h4</c>,
    /// <c>div</c>. The classes are the same whichever element is chosen.
    /// </summary>
    [Parameter]
    public string As { get; set; } = DefaultElement;

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the card title.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the card title element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Base title styles (from shadcn/ui)
        "text-2xl font-semibold leading-none tracking-tight",
        // Custom classes (if provided)
        Class
    );

    /// <inheritdoc />
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, string.IsNullOrWhiteSpace(As) ? DefaultElement : As);
        builder.AddAttribute(1, "class", CssClass);
        builder.AddMultipleAttributes(2, AdditionalAttributes);
        builder.AddContent(3, ChildContent);
        builder.CloseElement();
    }
}
