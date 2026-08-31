namespace TrBlazeUI.Components.Badge;

/// <summary>
/// Defines the visual style variant for a Badge component.
/// </summary>
/// <remarks>
/// Badge variants follow the shadcn/ui design system and use CSS custom properties
/// for theming. Each variant conveys different meaning or urgency levels.
/// </remarks>
public enum BadgeVariant
{
    /// <summary>
    /// Default primary badge style with solid background.
    /// Uses --primary and --primary-foreground CSS variables.
    /// Suitable for highlighting important items or new content.
    /// </summary>
    Default,

    /// <summary>
    /// Secondary badge style with muted background.
    /// Uses --secondary and --secondary-foreground CSS variables.
    /// For alternative or less prominent labels.
    /// </summary>
    Secondary,

    /// <summary>
    /// Destructive badge style for warnings or errors.
    /// Uses --destructive and --destructive-foreground CSS variables.
    /// Indicates critical status or requires user attention.
    /// </summary>
    Destructive,

    /// <summary>
    /// Outlined badge style with transparent background and border.
    /// Uses --foreground CSS variable for text.
    /// Minimal style for subtle categorization or tags.
    /// </summary>
    Outline,

    /// <summary>
    /// Success badge style for healthy or completed status.
    /// Uses the --alert-success-bg tint with --alert-success-foreground text and an
    /// --alert-success border,
    /// matching <see cref="TrBlazeUI.Components.Alert.AlertVariant.Success"/> so status semantics stay
    /// consistent between a badge and the alert that explains it.
    /// </summary>
    Success,

    /// <summary>
    /// Informational badge style for neutral, non-urgent status.
    /// Uses the --alert-info-bg tint with --alert-info-foreground text and an
    /// --alert-info border,
    /// matching <see cref="TrBlazeUI.Components.Alert.AlertVariant.Info"/>.
    /// </summary>
    Info,

    /// <summary>
    /// Warning badge style for "needs attention" status that is not yet an error.
    /// Uses the --alert-warning-bg tint with --alert-warning-foreground text and an
    /// --alert-warning border,
    /// matching <see cref="TrBlazeUI.Components.Alert.AlertVariant.Warning"/>. Prefer this over
    /// <see cref="Destructive"/>, which reads as a failure.
    /// </summary>
    Warning
}
