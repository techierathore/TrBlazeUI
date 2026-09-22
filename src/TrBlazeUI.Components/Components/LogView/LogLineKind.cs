namespace TrBlazeUI.Components.LogView;

/// <summary>
/// Specifies how one line of command output is marked in a <see cref="LogView"/>.
/// </summary>
/// <remarks>
/// <para>
/// The name is deliberately not <c>LogLevel</c>. A consuming page that has both
/// <c>@using Microsoft.Extensions.Logging</c> and <c>@using TrBlazeUI.Components.LogView</c> would
/// then see two types called <c>LogLevel</c> and every unqualified use would fail to compile.
/// </para>
/// <para>
/// The set is intentionally small. <see cref="Ordinary"/> covers plain and informational output,
/// so there is no separate <c>Info</c> value; <see cref="Success"/> exists because the last line of
/// a build ("Build succeeded") is the one line consumers always want picked out, and the
/// <c>--success</c> design token is already part of the theme.
/// </para>
/// </remarks>
public enum LogLineKind
{
    /// <summary>
    /// Plain output. Rendered in the normal foreground colour with a blank marker.
    /// </summary>
    Ordinary,

    /// <summary>
    /// Output that reports something completing well, for example <c>"Build succeeded"</c>.
    /// Rendered from the <c>--success</c> token with a <c>✓</c> marker.
    /// </summary>
    Success,

    /// <summary>
    /// Output that reports a warning. Rendered from the <c>--alert-warning</c> token with a
    /// <c>!</c> marker.
    /// </summary>
    Warning,

    /// <summary>
    /// Output that reports an error or a failure. Rendered from the <c>--destructive</c> token with
    /// a <c>×</c> marker.
    /// </summary>
    Failure
}
