using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Primitives.Collapsible;

/// <summary>
/// A headless content component that displays collapsible content controlled by a CollapsibleTrigger.
/// </summary>
/// <remarks>
/// <para>
/// The CollapsibleContent component is a headless primitive that handles content visibility
/// based on the collapsible state. It provides no default styling, only behavior and accessibility.
/// </para>
/// <para>
/// This component must be used as a child of a <see cref="Collapsible"/> component.
/// It receives the collapsible state via Blazor's CascadingParameter and renders
/// content conditionally based on the Open state.
/// </para>
/// <para>
/// Accessibility features (WCAG 2.1 AA):
/// <list type="bullet">
/// <item>Semantic region role for screen readers</item>
/// <item>aria-hidden attribute for proper screen reader behavior</item>
/// <item>data-state attribute for CSS styling hooks</item>
/// </list>
/// </para>
/// <para>
/// This primitive applies NO hiding of its own. With the default
/// <see cref="ForceMount"/> = <c>false</c> a closed region is simply not rendered; with
/// <see cref="ForceMount"/> = <c>true</c> the subtree stays in the DOM in every state and the
/// caller owns hiding it. A caller that force-mounts for animation purposes MUST take the closed
/// region out of layout itself (an inline <c>display: none</c> plus <c>hidden</c>), because a
/// <c>grid-rows-[0fr]</c> / <c>overflow: hidden</c> collapse only clips painting: the descendants
/// keep their natural boxes and will overlap whatever follows the collapsible, which is invisible
/// in a screenshot but real to hit-testing, geometry checks and the accessibility tree. The
/// styled <c>TrBlazeUI.Components.Collapsible.CollapsibleContent</c> does exactly that.
/// </para>
/// </remarks>
/// <example>
/// Basic headless content:
/// <code>
/// &lt;Collapsible&gt;
///     &lt;CollapsibleTrigger&gt;
///         Show Content
///     &lt;/CollapsibleTrigger&gt;
///     &lt;CollapsibleContent&gt;
///         This content can be expanded or collapsed.
///     &lt;/CollapsibleContent&gt;
/// &lt;/Collapsible&gt;
/// </code>
///
/// Styled content with custom classes:
/// <code>
/// &lt;CollapsibleContent class="p-4 border-t transition-all"&gt;
///     &lt;div class="space-y-2"&gt;
///         &lt;p&gt;Paragraph 1&lt;/p&gt;
///         &lt;p&gt;Paragraph 2&lt;/p&gt;
///     &lt;/div&gt;
/// &lt;/CollapsibleContent&gt;
/// </code>
///
/// Animated content using data-state:
/// <code>
/// &lt;CollapsibleContent class="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"&gt;
///     &lt;div class="p-4"&gt;
///         &lt;p&gt;Content with smooth animation&lt;/p&gt;
///     &lt;/div&gt;
/// &lt;/CollapsibleContent&gt;
/// </code>
/// </example>
public partial class CollapsibleContent : ComponentBase
{
    private bool objShouldRender => ForceMount || (Context?.Open ?? false);

    /// <summary>
    /// Gets the cascaded collapsible context from the parent Collapsible component.
    /// </summary>
    /// <value>
    /// A <see cref="CollapsibleContext"/> instance provided by the parent, or <c>null</c>
    /// if this component is not nested within a <see cref="Collapsible"/>.
    /// </value>
    [CascadingParameter]
    public CollapsibleContext? Context { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered when the collapsible is expanded.
    /// </summary>
    /// <value>
    /// A <see cref="RenderFragment"/> containing the collapsible content, or <c>null</c>.
    /// </value>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Whether to force mount the content even when the collapsible is closed.
    /// When true, content remains mounted (useful for CSS animations when styled).
    /// When false (default), content is unmounted when closed.
    /// </summary>
    /// <remarks>
    /// Force-mounting keeps the region in the DOM but does not hide it - see the remarks on the
    /// type. Anything that sets this to <c>true</c> is responsible for removing the closed region
    /// from layout, or a closed panel will silently overlap the content beneath it.
    /// </remarks>
    [Parameter]
    public bool ForceMount { get; set; } = false;

    /// <summary>
    /// Gets or sets additional attributes to be applied to the content container element.
    /// </summary>
    /// <value>
    /// A dictionary of additional HTML attributes including class, style, etc.
    /// </value>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
