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
