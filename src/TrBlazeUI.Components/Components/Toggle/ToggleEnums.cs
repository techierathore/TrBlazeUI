using System.Diagnostics.CodeAnalysis;

namespace TrBlazeUI.Components.Toggle;

/// <summary>
/// Specifies the visual style variant of a toggle.
/// </summary>
public enum ToggleVariant
{
    /// <summary>
    /// Default toggle styling with no border.
    /// </summary>
    Default,

    /// <summary>
    /// Outlined toggle with a visible border.
    /// </summary>
    Outline
}

/// <summary>
/// Specifies how the chosen item of a toggle group is painted.
/// </summary>
/// <remarks>
/// The chosen look used to be fixed to the accent colour. On a theme whose accent is a soft tint
/// the chosen item of a segmented switch then reads as a tinted pill where the design draws a
/// plain card segment, and no on-state class a caller could pass was in the shipped stylesheet
/// (Chatur TR-012).
/// </remarks>
public enum ToggleOnVariant
{
    /// <summary>
    /// The accent colour with its foreground. This is the look a toggle group has always had.
    /// </summary>
    Accent,

    /// <summary>
    /// The card colour with its foreground — a plain card segment, for a group sitting on a
    /// muted track.
    /// </summary>
    Card,

    /// <summary>
    /// The primary colour with its foreground — the strongest look, for a choice that must stand out.
    /// </summary>
    Primary
}

/// <summary>
/// Specifies the size of a toggle.
/// </summary>
public enum ToggleSize
{
    /// <summary>
    /// Small toggle size.
    /// </summary>
    Small,

    /// <summary>
    /// Default (medium) toggle size.
    /// </summary>
    Default,

    /// <summary>
    /// Large toggle size.
    /// </summary>
    Large
}

/// <summary>
/// Specifies the selection mode of a toggle group.
/// </summary>
[SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "Single is a domain term for selection mode")]
public enum ToggleGroupType
{
    /// <summary>
    /// Only a single toggle within the group can be selected at a time.
    /// </summary>
    Single,

    /// <summary>
    /// Multiple toggles within the group can be selected simultaneously.
    /// </summary>
    Multiple
}
