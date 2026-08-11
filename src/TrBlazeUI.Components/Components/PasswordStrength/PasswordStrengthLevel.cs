namespace TrBlazeUI.Components.PasswordStrength;

/// <summary>
/// The strength of a password, as scored by <c>PasswordStrength.Evaluate</c>.
/// </summary>
public enum PasswordStrengthLevel
{
    /// <summary>No password entered yet.</summary>
    Empty = 0,

    /// <summary>Too short, or too little variety.</summary>
    Weak = 1,

    /// <summary>Long enough with some variety.</summary>
    Fair = 2,

    /// <summary>Long, mixed case and digits or symbols.</summary>
    Good = 3,

    /// <summary>Long, mixed case, digits and symbols.</summary>
    Strong = 4
}
