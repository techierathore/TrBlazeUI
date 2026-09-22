namespace TrBlazeUI.Components.CodeEditor;

/// <summary>
/// One open file in an <c>EditorTabs</c> strip.
/// </summary>
/// <param name="Id">Identifies the file. It is what <c>EditorTabs.ActiveId</c> holds, so it must be
/// unique within the strip; a full path is a good choice.</param>
/// <param name="Label">The name shown on the tab, usually the file name.</param>
/// <param name="IsDirty">Whether the file has unsaved work. A dirty tab shows a dot and reads as
/// "unsaved changes" to a screen reader, so the mark is never colour alone.</param>
/// <remarks>
/// A record, so a list of tabs compares by value and a change of one flag produces a new instance
/// that Blazor can see.
/// </remarks>
public sealed record EditorTabItem(string Id, string Label, bool IsDirty = false);
