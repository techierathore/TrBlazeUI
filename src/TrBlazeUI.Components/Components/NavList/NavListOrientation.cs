namespace TrBlazeUI.Components.NavList;

/// <summary>
/// The axis a <see cref="NavList{TItem}"/> lays its rows out on, and the arrow keys that move
/// between them.
/// </summary>
public enum NavListOrientation
{
    /// <summary>
    /// Rows stack downward; Up and Down move between them. This is the default.
    /// </summary>
    Vertical = 0,

    /// <summary>
    /// Rows sit in a scrolling row; Left and Right move between them.
    /// </summary>
    Horizontal = 1
}
