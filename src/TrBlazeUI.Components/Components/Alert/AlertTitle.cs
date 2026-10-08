using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace TrBlazeUI.Components.Alert;

/// <summary>
/// The title of an alert.
/// </summary>
/// <remarks>
/// <para>
/// Renders an <c>h5</c> by default; <see cref="As"/> chooses another element so the page keeps a
/// correct heading outline. Written as a code component because Razor cannot take an element name
/// from a parameter; the classes are unchanged.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;AlertTitle&gt;Heads up!&lt;/AlertTitle&gt;
/// &lt;AlertTitle As="h3"&gt;Heads up, as a third-level heading&lt;/AlertTitle&gt;
/// </code>
/// </example>
public class AlertTitle : ComponentBase
{
    private const string DefaultElement = "h5";

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the alert title.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the heading element to render, so a page keeps a correct heading outline
    /// (Sevak TR-008). Default <c>h5</c>; any element name is accepted, e.g. <c>h2</c>, <c>h4</c>,
    /// <c>div</c>. The classes are the same whichever element is chosen.
    /// </summary>
    [Parameter]
    public string As { get; set; } = DefaultElement;

    /// <summary>
    /// Gets or sets the content to be rendered inside the alert title.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes (id, style, data-*, aria-*, event handlers)
    /// forwarded to the rendered root element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the alert title element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "mb-1 font-medium leading-none tracking-tight",
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
