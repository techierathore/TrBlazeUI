namespace TrBlazeUI.Components.Toast;

/// <summary>
/// Defines the visual style variant for a Toast component.
/// </summary>
/// <remarks>
/// <see cref="Success"/>, <see cref="Info"/> and <see cref="Warning"/> paint the same tinted
/// surfaces as <c>AlertVariant</c> and <c>BadgeVariant</c>, so the three status families agree
/// (Sevak TR-023). <see cref="Destructive"/> stays the solid red fill.
/// </remarks>
public enum ToastVariant
{
    /// <summary>
    /// Default toast style for general messages.
    /// </summary>
    Default,

    /// <summary>
    /// Destructive toast style for errors: a solid red fill.
    /// </summary>
    Destructive,

    /// <summary>
    /// Success toast style: the tinted green surface of <c>AlertVariant.Success</c>.
    /// </summary>
    Success,

    /// <summary>
    /// Informational toast style: the tinted blue surface of <c>AlertVariant.Info</c>.
    /// </summary>
    Info,

    /// <summary>
    /// Warning toast style for a caution that is not a failure: the tinted amber surface of
    /// <c>AlertVariant.Warning</c>.
    /// </summary>
    Warning
}
