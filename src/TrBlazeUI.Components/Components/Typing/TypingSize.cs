namespace TrBlazeUI.Components.Typing;

/// <summary>
/// Defines the size options for a Typing component.
/// </summary>
/// <remarks>
/// The three steps mirror <c>SpinnerSize</c> (Small / Default / Large) and keep its 16 : 24 : 40
/// proportions, but the Typing indicator is sized in <c>em</c> rather than pixels so it always
/// matches the font size of the text it is written inside. A Typing indicator placed in a
/// <c>text-sm</c> message is therefore smaller than the same indicator in a <c>text-lg</c> one,
/// without the caller changing anything.
/// </remarks>
public enum TypingSize
{
    /// <summary>
    /// Small dots (0.27em each).
    /// For dense lists, captions and secondary text.
    /// </summary>
    Small,

    /// <summary>
    /// Default dots (0.4em each).
    /// The size to use inside an ordinary line of body text.
    /// </summary>
    Default,

    /// <summary>
    /// Large dots (0.67em each).
    /// For headings or a deliberately prominent "still writing" cue.
    /// </summary>
    Large
}
