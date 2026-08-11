namespace TrBlazeUI.Components.Stat;

/// <summary>
/// The direction of a <c>StatTile</c> trend, which selects the colour it is drawn in.
/// </summary>
public enum StatTrend
{
    /// <summary>No direction; the trend is drawn in the muted foreground colour.</summary>
    Neutral,

    /// <summary>An increase; drawn in the success colour.</summary>
    Up,

    /// <summary>A decrease; drawn in the destructive colour.</summary>
    Down
}
