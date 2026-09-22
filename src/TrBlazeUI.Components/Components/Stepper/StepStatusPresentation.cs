namespace TrBlazeUI.Components.Stepper;

/// <summary>
/// The glyph, the accessible name and the token-driven colours that draw one <see cref="StepStatus"/>.
/// </summary>
/// <remarks>
/// <para>
/// Shared by <c>StepperItem</c> and <c>TimelineItem</c> so the same run drawn as a stepper and as a
/// timeline cannot disagree about what "Retried" looks like.
/// </para>
/// <para>
/// Each status differs from every other in three ways at once — glyph, fill and accessible name —
/// so it survives a greyscale screen, a colour-vision difference and a screen reader alike
/// (WCAG 1.4.1). Colours come from the theme's own tokens (<c>--success</c>, <c>--destructive</c>,
/// <c>--alert-warning</c>, <c>--primary</c>, <c>--muted-foreground</c>), never from literal values,
/// so a retheme carries them.
/// </para>
/// </remarks>
internal static class StepStatusPresentation
{
    /// <summary>
    /// Gets the lowercase token written to the marker's <c>data-status</c> attribute.
    /// </summary>
    /// <param name="aStatus">The status to name.</param>
    /// <returns>A stable, lowercase identifier for styling and for tests.</returns>
    internal static string Name(StepStatus aStatus) => aStatus switch
    {
        StepStatus.Running => "running",
        StepStatus.Waiting => "waiting",
        StepStatus.Done => "done",
        StepStatus.Retried => "retried",
        StepStatus.Failed => "failed",
        _ => "pending"
    };

    /// <summary>
    /// Gets the marker's accessible name — the non-colour signal a screen reader announces.
    /// </summary>
    /// <param name="aStatus">The status to name.</param>
    /// <returns>A short human-readable status name, for example <c>"Failed"</c>.</returns>
    internal static string Label(StepStatus aStatus) => aStatus switch
    {
        StepStatus.Running => "Running",
        StepStatus.Waiting => "Waiting",
        StepStatus.Done => "Done",
        StepStatus.Retried => "Retried",
        StepStatus.Failed => "Failed",
        _ => "Pending"
    };

    /// <summary>
    /// Gets the character drawn inside the marker.
    /// </summary>
    /// <param name="aStatus">The status to draw.</param>
    /// <returns>
    /// The glyph, or an empty string for <see cref="StepStatus.Pending"/>, which keeps whatever the
    /// marker already held — the step number in a stepper, nothing in a timeline.
    /// </returns>
    internal static string Glyph(StepStatus aStatus) => aStatus switch
    {
        StepStatus.Running => "●",
        StepStatus.Waiting => "…",
        StepStatus.Done => "✓",
        StepStatus.Retried => "↻",
        StepStatus.Failed => "✕",
        _ => string.Empty
    };

    /// <summary>
    /// Gets the border, fill and text colour classes for the marker.
    /// </summary>
    /// <param name="aStatus">The status to draw.</param>
    /// <returns>A space-separated class list, merged after the caller's own size classes.</returns>
    /// <remarks>
    /// Waiting and Retried share the warning token but differ in fill — Waiting is outlined,
    /// Retried is filled — so the two are told apart without reading the glyph.
    /// </remarks>
    internal static string MarkerColourClass(StepStatus aStatus) => aStatus switch
    {
        StepStatus.Running => "border-primary text-primary",
        StepStatus.Waiting => "border-alert-warning text-alert-warning",
        StepStatus.Done => "border-success bg-success text-success-foreground",
        StepStatus.Retried => "border-alert-warning bg-alert-warning-bg text-alert-warning-foreground",
        StepStatus.Failed => "border-destructive bg-destructive text-destructive-foreground",
        _ => "border-border text-muted-foreground"
    };
}
