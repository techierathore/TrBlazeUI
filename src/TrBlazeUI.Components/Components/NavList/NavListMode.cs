namespace TrBlazeUI.Components.NavList;

/// <summary>
/// The ARIA semantic a <see cref="NavList{TItem}"/> renders with.
/// </summary>
/// <remarks>
/// The two values are different controls, not two skins of one control. Choose by what picking a
/// row does: if it changes what the rest of the same screen shows, the row is a choice
/// (<see cref="Select"/>); if it takes the reader somewhere else, the row is a link
/// (<see cref="Navigation"/>).
/// </remarks>
public enum NavListMode
{
    /// <summary>
    /// A single-select list of choices: <c>role="listbox"</c> with <c>role="option"</c> rows and
    /// <c>aria-selected</c> on each. The chosen row stays on the page and drives a detail pane.
    /// This is the default.
    /// </summary>
    Select = 0,

    /// <summary>
    /// A navigation list: a <c>&lt;nav&gt;</c> of links with <c>aria-current="page"</c> on the
    /// chosen one. Picking a row follows its <see cref="NavList{TItem}.ItemHref"/>.
    /// </summary>
    Navigation = 1
}
