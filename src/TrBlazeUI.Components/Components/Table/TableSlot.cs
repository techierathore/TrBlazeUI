namespace TrBlazeUI.Components.Table;

/// <summary>
/// Builds the attribute set a styled table part passes to its headless primitive: the part's
/// <c>data-slot</c> name first, then the caller's attributes, which win on a clash.
/// </summary>
/// <remarks>
/// The primitives (<c>TrBlazeUI.Primitives.Table.TableHeader</c>, <c>TableBody</c>,
/// <c>TableCell</c>) splat whatever they are given onto their element, so the slot name travels
/// with the caller's attributes rather than as a separate parameter the primitives do not have.
/// </remarks>
internal static class TableSlot
{
    /// <summary>
    /// Returns a dictionary holding <c>data-slot</c> set to <paramref name="aSlot"/> plus every
    /// entry of <paramref name="aAttributes"/>.
    /// </summary>
    /// <param name="aSlot">The slot name, e.g. <c>table-cell</c>.</param>
    /// <param name="aAttributes">The caller's attributes; may be null.</param>
    public static Dictionary<string, object> With(string aSlot, Dictionary<string, object>? aAttributes)
    {
        var vResult = new Dictionary<string, object>((aAttributes?.Count ?? 0) + 1, StringComparer.Ordinal)
        {
            ["data-slot"] = aSlot
        };

        if (aAttributes is not null)
        {
            foreach (var vPair in aAttributes)
            {
                vResult[vPair.Key] = vPair.Value;
            }
        }

        return vResult;
    }
}
