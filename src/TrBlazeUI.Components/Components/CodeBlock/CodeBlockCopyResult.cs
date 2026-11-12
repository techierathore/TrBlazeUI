namespace TrBlazeUI.Components.CodeBlock;

/// <summary>
/// The outcome of a <see cref="CodeBlock"/> copy attempt, passed to <c>CodeBlock.OnCopied</c>.
/// </summary>
/// <remarks>
/// A copy that never ran (the circuit was going away, or the component was still prerendering)
/// raises no callback, so a page only ever sees one of these two outcomes (Sevak TR-047).
/// </remarks>
public enum CodeBlockCopyResult
{
    /// <summary>The code reached the clipboard.</summary>
    Copied,

    /// <summary>The browser refused the copy; the user has to select the code and copy it by hand.</summary>
    Failed
}
