using Microsoft.JSInterop;

namespace TrBlazeUI.Primitives.Utilities;

/// <summary>
/// Releases a component's JavaScript side during teardown without letting a JavaScript side that is
/// already gone end the session.
/// </summary>
/// <remarks>
/// <para>
/// A component's <c>DisposeAsync</c> often calls a clean-up function on its module and then releases
/// the module. By then the JavaScript side may be gone: the Blazor Server circuit has closed
/// (<see cref="JSDisconnectedException"/>), the page closed before it answered
/// (<see cref="TaskCanceledException"/>), or the document was reloaded under a live .NET side, as a
/// WebView reload does, so the reference's id is unknown to the page and the call fails with
/// <see cref="JSException"/> "JS object instance with ID ... does not exist". Each of these is
/// ordinary teardown, not a fault; unguarded, it escapes into the renderer and the session ends
/// (Sevak TR-049).
/// </para>
/// <para>
/// Steps: each method does nothing for a null reference, makes its one call, and swallows only the
/// teardown faults named by <see cref="IsTeardownFault"/>. Calling <see cref="InvokeVoidAsync"/> and
/// then <see cref="ReleaseAsync"/> always attempts the release, even when the clean-up call failed.
/// </para>
/// </remarks>
public static class JSTeardown
{
    /// <summary>
    /// Tells whether an exception means the JavaScript side is already gone, which during teardown is
    /// expected and safe to ignore.
    /// </summary>
    /// <param name="aException">The exception raised by a JavaScript call made during teardown.</param>
    /// <returns><see langword="true"/> for a closed circuit, a cancelled call, an unknown or failed
    /// JavaScript object, or a disposed runtime; otherwise <see langword="false"/>.</returns>
    public static bool IsTeardownFault(Exception aException) =>
        aException is JSDisconnectedException
            or JSException
            or TaskCanceledException
            or ObjectDisposedException;

    /// <summary>
    /// Calls a clean-up function on a JavaScript object during teardown, ignoring a JavaScript side
    /// that is already gone.
    /// </summary>
    /// <param name="aReference">The module or object reference; nothing happens when it is null.</param>
    /// <param name="aIdentifier">The function to call, relative to the reference.</param>
    /// <param name="aArgs">The arguments, as for <c>InvokeVoidAsync</c>.</param>
    /// <returns>A task that completes when the call has finished or been abandoned.</returns>
    public static async ValueTask InvokeVoidAsync(IJSObjectReference? aReference, string aIdentifier, params object?[]? aArgs)
    {
        if (aReference == null)
        {
            return;
        }

        try
        {
            await aReference.InvokeVoidAsync(aIdentifier, aArgs).ConfigureAwait(false);
        }
        catch (Exception vException) when (IsTeardownFault(vException))
        {
            // The JavaScript side is gone; there is nothing left to clean up.
        }
    }

    /// <summary>
    /// Releases a JavaScript object reference during teardown, ignoring a JavaScript side that is
    /// already gone.
    /// </summary>
    /// <param name="aReference">The module or object reference; nothing happens when it is null.</param>
    /// <returns>A task that completes when the release has finished or been abandoned.</returns>
    public static async ValueTask ReleaseAsync(IJSObjectReference? aReference)
    {
        if (aReference == null)
        {
            return;
        }

        try
        {
            await aReference.DisposeAsync().ConfigureAwait(false);
        }
        catch (Exception vException) when (IsTeardownFault(vException))
        {
            // The JavaScript side is gone; the reference went with it.
        }
    }
}
