namespace TrBlazeUI.Primitives.Select;

/// <summary>
/// The non-generic view of a <see cref="SelectContext{TValue}"/> that a value display needs.
/// </summary>
/// <remarks>
/// A styled <c>SelectValue</c> has no <c>TValue</c> of its own, so it receives the context through
/// this interface rather than through <c>dynamic</c>. A <c>dynamic</c> call that passed the bound value
/// as a statically typed <c>object</c> could not bind to <c>HasItemWithValue(TValue)</c> and threw
/// <c>RuntimeBinderException</c> on every re-render where no item carried the value (TechieBlog TR-077).
/// </remarks>
public interface ISelectValueDisplay
{
    /// <summary>
    /// Gets the scoped id of the value element, referenced by the trigger's <c>aria-labelledby</c>.
    /// </summary>
    string ValueId { get; }

    /// <summary>
    /// Resolves the text to show for the current value, or null when the placeholder belongs there.
    /// </summary>
    /// <returns>The display text, the raw value as a first-paint fallback, or null.</returns>
    string? ResolveDisplayText();
}
