namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// Keeps a bound text control's DOM value from being clobbered by the server's own echo.
/// </summary>
/// <remarks>
/// <para>
/// A naive controlled input renders <c>value="@Value"</c> and assigns <c>Value</c> inside its
/// <c>oninput</c> handler. On a Blazor <b>Server</b> circuit every keystroke then round-trips, and
/// the render that comes back writes a <c>value</c> into the DOM that is already one or more
/// keystrokes behind whatever the user has typed since. Characters are dropped and reordered, and
/// the caret is reset — silently, and worst for anyone whose assistive technology injects text
/// rather than pressing keys (voice input, switch/AAC devices, password managers, paste-and-tab).
/// </para>
/// <para>
/// This helper separates three values that a naive implementation conflates:
/// what the DOM holds, what the render tree last emitted, and what the parent last supplied.
/// The echo of the user's own typing never reaches the render tree, so Blazor's diff produces no
/// DOM write at all; a genuine programmatic change still does, and
/// <see cref="RenderKey"/> forces the element to be rebuilt in the one case where the new value
/// happens to equal the value already in the render tree (for example clearing a field back to
/// its initial empty string).
/// </para>
/// </remarks>
internal sealed class TextValueSync
{
    private string? objDomValue;
    private string? objRenderedValue;
    private string? objSuppliedValue;
    private bool objInitialized;

    /// <summary>
    /// Gets the value the control should render into its <c>value</c> attribute.
    /// </summary>
    public string? RenderedValue => objRenderedValue;

    /// <summary>
    /// Gets the key for the rendered element. It changes only when the DOM must be refreshed with
    /// a value that the render tree already contains.
    /// </summary>
    public int RenderKey { get; private set; }

    /// <summary>
    /// Records the value supplied by the parent component. Call from <c>OnParametersSet</c>.
    /// </summary>
    /// <param name="aValue">The value of the control's <c>Value</c> parameter.</param>
    public void OnValueSupplied(string? aValue)
    {
        if (!objInitialized)
        {
            objInitialized = true;
            objSuppliedValue = aValue;
            objDomValue = aValue;
            objRenderedValue = aValue;
            return;
        }

        // The parent re-rendered without changing the value: nothing to push.
        if (string.Equals(aValue, objSuppliedValue, StringComparison.Ordinal))
        {
            return;
        }

        objSuppliedValue = aValue;

        // The parent is echoing back exactly what the user just typed: leave the DOM alone.
        if (string.Equals(aValue, objDomValue, StringComparison.Ordinal))
        {
            return;
        }

        // Same value as the render tree already holds, but a different DOM value, so the diff
        // would produce no write. Re-key the element to force it.
        if (string.Equals(aValue, objRenderedValue, StringComparison.Ordinal))
        {
            RenderKey++;
        }

        objDomValue = aValue;
        objRenderedValue = aValue;
    }

    /// <summary>
    /// Records the value the DOM now holds after a user keystroke. Call from the input handler.
    /// </summary>
    /// <param name="aValue">The value reported by the <c>oninput</c> event.</param>
    public void OnUserInput(string? aValue)
    {
        objDomValue = aValue;
        objSuppliedValue = aValue;
    }
}
