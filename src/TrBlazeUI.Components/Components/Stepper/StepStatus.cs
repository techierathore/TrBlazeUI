namespace TrBlazeUI.Components.Stepper;

/// <summary>
/// What became of one step in a <c>Stepper</c>, or of one entry in a <c>Timeline</c>.
/// </summary>
/// <remarks>
/// <para>
/// A step's state is not always its position. A chain can pause in the middle, a step can succeed
/// only on a second try, and a later step can run while an earlier one is still waiting — none of
/// which can be derived from the index of the current step. Set <c>StepperItem.Status</c> or
/// <c>TimelineItem.Status</c> to draw what actually happened; leave it unset and the step keeps
/// deriving its look from its position, exactly as before.
/// </para>
/// <para>
/// Every value is drawn with its own glyph and its own accessible name as well as its own colour,
/// so the state is never signalled by colour alone (WCAG 1.4.1).
/// </para>
/// </remarks>
public enum StepStatus
{
    /// <summary>Not started. Drawn muted, with the step's number.</summary>
    Pending,

    /// <summary>Running now. Drawn in the primary colour, with a filled dot.</summary>
    Running,

    /// <summary>Started, then paused on something outside the flow — an approval, a queue, a human.</summary>
    Waiting,

    /// <summary>Finished, successfully. Drawn filled in the success colour, with a tick.</summary>
    Done,

    /// <summary>Finished successfully, but only after being tried again.</summary>
    Retried,

    /// <summary>Finished unsuccessfully. Drawn filled in the destructive colour, with a cross.</summary>
    Failed
}
