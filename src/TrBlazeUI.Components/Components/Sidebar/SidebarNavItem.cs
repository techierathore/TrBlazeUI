namespace TrBlazeUI.Components.Sidebar;

/// <summary>
/// Represents a navigation item in the sidebar with a URL and display label.
/// Used by SidebarCollapsibleMenuItem to render sub-menu items.
/// </summary>
/// <param name="Href">The URL to navigate to.</param>
/// <param name="Label">The display text for the menu item.</param>
public record SidebarNavItem(string Href, string Label);
