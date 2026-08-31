using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Collapsible;

/// <summary>
/// A styled content component that displays collapsible content controlled by a CollapsibleTrigger.
/// </summary>
/// <remarks>
/// <para>
/// The CollapsibleContent component is a styled wrapper around the primitive CollapsibleContent
/// that applies shadcn/ui styling while maintaining all the behavior and accessibility.
/// </para>
/// <para>
/// This component must be used as a child of a <see cref="Collapsible"/> component.
/// </para>
/// <para>
/// Layout while closed: the content subtree stays mounted so the expand/collapse animation can
/// run, but the region root is marked <c>hidden</c> and given an inline <c>display: none</c>, so
/// a closed panel occupies no space and none of its descendants report a layout box. The
/// <c>grid-rows-[0fr]</c> + <c>overflow: hidden</c> animation technique alone is not enough -
/// it clips painting only, leaving descendants with their natural boxes to overlap the content
/// that follows (invisible in a screenshot, but real to hit-testing and to the accessibility
/// tree). Set <see cref="Unmount"/> to remove the subtree entirely instead, trading the
/// animation for the smallest possible DOM.
/// </para>
/// <para>
/// Accessibility features:
/// <list type="bullet">
/// <item>Semantic region role for screen readers</item>
/// <item>aria-hidden attribute for proper screen reader behavior</item>
/// <item>A closed region is removed from layout and from the accessibility tree</item>
/// <item>Smooth animations via CSS transitions</item>
/// </list>
/// </para>
/// </remarks>
/// <example>
/// Basic collapsible content:
/// <code>
/// &lt;Collapsible&gt;
///     &lt;CollapsibleTrigger&gt;
///         &lt;Button&gt;Show Content&lt;/Button&gt;
///     &lt;/CollapsibleTrigger&gt;
///     &lt;CollapsibleContent&gt;
///         &lt;p&gt;This content can be expanded or collapsed.&lt;/p&gt;
///     &lt;/CollapsibleContent&gt;
/// &lt;/Collapsible&gt;
/// </code>
///
/// Styled content with padding:
/// <code>
/// &lt;CollapsibleContent Class="p-4 border-t"&gt;
///     &lt;div class="space-y-2"&gt;
///         &lt;p&gt;Paragraph 1&lt;/p&gt;
///         &lt;p&gt;Paragraph 2&lt;/p&gt;
///     &lt;/div&gt;
/// &lt;/CollapsibleContent&gt;
/// </code>
///
/// Animated content with transitions:
/// <code>
/// &lt;CollapsibleContent Class="transition-all duration-300 ease-in-out overflow-hidden"&gt;
///     &lt;div class="p-4"&gt;
///         &lt;p&gt;Content with smooth slide animation&lt;/p&gt;
///     &lt;/div&gt;
/// &lt;/CollapsibleContent&gt;
/// </code>
/// </example>
public partial class CollapsibleContent : ComponentBase, IDisposable
{
    /// <summary>
    /// Duration of the grid-template-rows collapse transition, in milliseconds.
    /// Must stay in step with the <c>duration-200</c> utility in <see cref="GridCssClass"/>.
    /// </summary>
    private const int CollapseTransitionMs = 200;

    /// <summary>
    /// Delay before releasing the pinned 0fr start value when expanding, in milliseconds.
    /// One frame is enough for the browser to record a starting style to transition from.
    /// </summary>
    private const int ExpandStartFrameMs = 16;

    private CancellationTokenSource? objTransitionCts;
    private bool objHasRendered;
    private bool objWasOpen;
    private bool objIsCollapsed = true;
    private bool objIsPinnedClosed;

    /// <summary>
    /// Gets the cascaded collapsible context supplied by the parent Collapsible.
    /// </summary>
    /// <value>
    /// A <see cref="TrBlazeUI.Primitives.Collapsible.CollapsibleContext"/> instance, or
    /// <c>null</c> when this component is not nested within a Collapsible.
    /// </value>
    [CascadingParameter]
    public TrBlazeUI.Primitives.Collapsible.CollapsibleContext? Context { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the content container element.
    /// </summary>
    /// <value>
    /// A string containing one or more CSS class names, or <c>null</c>.
    /// </value>
    /// <remarks>
    /// Use this parameter to style the content area and add animations.
    /// Common Tailwind utilities include:
    /// <list type="bullet">
    /// <item>Padding: <c>p-4</c>, <c>px-6 py-4</c></item>
    /// <item>Borders: <c>border-t</c>, <c>border-x</c></item>
    /// <item>Background: <c>bg-muted</c>, <c>bg-card</c></item>
    /// <item>Transitions: <c>transition-all duration-300</c></item>
    /// <item>Animation: <c>animate-in slide-in-from-top</c></item>
    /// <item>Overflow: <c>overflow-hidden</c> (for smooth height transitions)</item>
    /// </list>
    /// </remarks>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered when the collapsible is expanded.
    /// </summary>
    /// <value>
    /// A <see cref="RenderFragment"/> containing the collapsible content, or <c>null</c>.
    /// </value>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets whether the content subtree is removed from the DOM while closed.
    /// </summary>
    /// <value>
    /// <c>false</c> (default) keeps the subtree mounted but hidden, so the expand/collapse
    /// transition can run. <c>true</c> unmounts it, which drops the animation but leaves the
    /// smallest possible DOM. Either way a closed panel contributes no layout box.
    /// </value>
    [Parameter]
    public bool Unmount { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the CSS classes for the grid container (for animation).
    /// </summary>
    /// <remarks>
    /// These classes are applied to the outer container to enable smooth height transitions.
    /// User's custom classes are applied to an inner wrapper to avoid padding affecting the grid collapse.
    /// </remarks>
    private static string GridCssClass =>
        "grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out data-[state=open]:grid-rows-[1fr]";

    /// <summary>
    /// Tracks the cascaded open state and drives the show/hide sequencing around the transition.
    /// </summary>
    protected override void OnParametersSet()
    {
        var vIsOpen = Context?.Open ?? false;

        if (!objHasRendered)
        {
            // First parameter pass: adopt the state outright. A panel that starts closed must
            // never occupy layout, not even for a single frame.
            objWasOpen = vIsOpen;
            objIsCollapsed = !vIsOpen;
            objIsPinnedClosed = false;
            return;
        }

        if (vIsOpen == objWasOpen)
        {
            return;
        }

        objWasOpen = vIsOpen;
        CancelPendingTransition();

        if (vIsOpen)
        {
            // Expanding. Reveal the box first, but pin grid-template-rows at 0fr with an inline
            // style: a transition cannot start from `display: none`, so the browser needs one
            // frame with a real 0fr starting value before the open state's 1fr is allowed to win.
            objIsCollapsed = false;
            objIsPinnedClosed = true;
            ScheduleTransitionStep(ExpandStartFrameMs, () =>
            {
                objIsPinnedClosed = false;
            });

            return;
        }

        // Collapsing. data-state has already flipped to "closed", so the 1fr -> 0fr transition is
        // running; keep the box in layout until it finishes, then take it out entirely.
        objIsPinnedClosed = false;
        ScheduleTransitionStep(CollapseTransitionMs, () =>
        {
            objIsCollapsed = true;
        });
    }

    /// <summary>
    /// Records that the first render has happened, so later parameter changes are treated as
    /// transitions rather than as the initial state.
    /// </summary>
    /// <param name="firstRender">True on the component's first render.</param>
    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
        {
            objHasRendered = true;
        }
    }

    /// <summary>
    /// Cancels any in-flight transition step.
    /// </summary>
    public void Dispose()
    {
        GC.SuppressFinalize(this);
        CancelPendingTransition();
    }

    private void CancelPendingTransition()
    {
        if (objTransitionCts == null)
        {
            return;
        }

        objTransitionCts.Cancel();
        objTransitionCts.Dispose();
        objTransitionCts = null;
    }

    private void ScheduleTransitionStep(int aDelayMs, Action aStep)
    {
        objTransitionCts = new CancellationTokenSource();
        var vToken = objTransitionCts.Token;

        _ = RunTransitionStepAsync(aDelayMs, aStep, vToken);
    }

    private async Task RunTransitionStepAsync(int aDelayMs, Action aStep, CancellationToken aToken)
    {
        try
        {
            await Task.Delay(aDelayMs, aToken).ConfigureAwait(false);

            await InvokeAsync(() =>
            {
                if (aToken.IsCancellationRequested)
                {
                    return;
                }

                aStep();
                StateHasChanged();
            });
        }
        catch (OperationCanceledException)
        {
            // Superseded by a newer toggle, or the component went away.
        }
        catch (ObjectDisposedException)
        {
            // The component was disposed while the step was pending.
        }
    }

    /// <summary>
    /// Builds the attribute set for the region root, adding the closed-state hiding attributes.
    /// </summary>
    /// <returns>The attributes to splat onto the primitive content element.</returns>
    private Dictionary<string, object> GetRootAttributes()
    {
        var vAttributes = AdditionalAttributes == null
            ? new Dictionary<string, object>(StringComparer.Ordinal)
            : new Dictionary<string, object>(AdditionalAttributes, StringComparer.Ordinal);

        if (!objIsCollapsed && !objIsPinnedClosed)
        {
            return vAttributes;
        }

        if (objIsCollapsed)
        {
            // `hidden` alone would not hide this element: the `grid` utility sets display and
            // beats the user-agent [hidden] rule. The inline display:none is what actually
            // removes the box (nothing in a stylesheet can override an inline declaration);
            // `hidden` is kept alongside it so el.hidden and the a11y tree agree.
            vAttributes["hidden"] = "hidden";
        }

        var vDeclaration = objIsCollapsed ? "display:none" : "grid-template-rows:0fr";
        vAttributes["style"] = vAttributes.TryGetValue("style", out var vExisting)
            ? MergeStyle(vExisting?.ToString(), vDeclaration)
            : vDeclaration;

        return vAttributes;
    }

    private static string MergeStyle(string? aExisting, string aDeclaration)
    {
        if (string.IsNullOrWhiteSpace(aExisting))
        {
            return aDeclaration;
        }

        return $"{aExisting.TrimEnd().TrimEnd(';')};{aDeclaration}";
    }
}
