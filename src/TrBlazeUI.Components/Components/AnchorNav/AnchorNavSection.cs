namespace TrBlazeUI.Components.AnchorNav;

/// <summary>
/// One entry in an <c>AnchorNav</c>: the id of a section on the page and the label to show for it.
/// </summary>
/// <param name="Id">The <c>id</c> attribute of the section element on the page.</param>
/// <param name="Label">The link text.</param>
public sealed record AnchorNavSection(string Id, string Label);
