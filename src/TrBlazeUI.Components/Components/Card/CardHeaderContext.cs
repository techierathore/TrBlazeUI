namespace TrBlazeUI.Components.Card;

/// <summary>
/// Provides context state for a <see cref="CardHeader"/> component and its child
/// <see cref="CardAction"/>.
/// </summary>
/// <remarks>
/// <para>
/// CardHeaderContext is used internally to detect whether a <see cref="CardAction"/>
/// is rendered inside a <see cref="CardHeader"/>. When an action is present, the header
/// renders a two-column grid so the action sits at the right edge of the title row
/// (Lekhak TR-009). Without an action, the header stays a single column so the
/// description falls under the title (Lekhak TR-010).
/// </para>
/// </remarks>
public sealed class CardHeaderContext
{
    /// <summary>
    /// Gets a value indicating whether a <see cref="CardAction"/> has registered itself
    /// inside the current <see cref="CardHeader"/>.
    /// </summary>
    public bool HasAction { get; private set; }

    /// <summary>
    /// Marks the current <see cref="CardHeader"/> as containing a <see cref="CardAction"/>.
    /// </summary>
    public void RegisterAction()
    {
        HasAction = true;
    }
}
