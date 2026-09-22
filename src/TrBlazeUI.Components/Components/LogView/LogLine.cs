namespace TrBlazeUI.Components.LogView;

/// <summary>
/// One line of command output shown in a <see cref="LogView"/>.
/// </summary>
/// <param name="Text">
/// The line's text, without its line break. Whitespace is preserved when it is rendered.
/// </param>
/// <param name="Kind">
/// How the line is marked. Default is <see cref="LogLineKind.Ordinary"/>.
/// </param>
/// <param name="Timestamp">
/// When the line was produced, or <c>null</c> when the writer keeps no time. Shown only when
/// <see cref="LogView.ShowTimestamps"/> is true.
/// </param>
/// <remarks>
/// A record so that a line is cheap to create per line of output and compares by value, the same
/// shape the comparison types in <c>TrBlazeUI.Components.DiffView</c> use.
/// </remarks>
public sealed record LogLine(string Text, LogLineKind Kind = LogLineKind.Ordinary, DateTimeOffset? Timestamp = null);
