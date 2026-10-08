namespace TrBlazeUI.Components.Chat;

/// <summary>
/// Who wrote a <see cref="ChatMessage"/>, which decides where it sits and how it is drawn.
/// </summary>
public enum ChatRole
{
    /// <summary>
    /// The person using the application. Drawn as a right-aligned bubble on the primary colour.
    /// </summary>
    User,

    /// <summary>
    /// The assistant or agent answering. Drawn as a left-aligned bubble on the muted surface.
    /// </summary>
    Assistant,

    /// <summary>
    /// A note from the system itself, such as "the model changed". Drawn centred, small and muted.
    /// </summary>
    System
}
