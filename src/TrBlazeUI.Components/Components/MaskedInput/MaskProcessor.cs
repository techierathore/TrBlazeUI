using System.Text;

namespace TrBlazeUI.Components.MaskedInput;

/// <summary>
/// Processes mask patterns and applies them to input values.
/// </summary>
public class MaskProcessor
{
    private readonly string objMask;
    private readonly char objPlaceholderChar;

    public MaskProcessor(string mask, char placeholderChar = '_')
    {
        objMask = mask;
        objPlaceholderChar = placeholderChar;
    }

    /// <summary>
    /// Gets the mask pattern.
    /// </summary>
    public string Mask => objMask;

    /// <summary>
    /// Gets the placeholder character.
    /// </summary>
    public char PlaceholderChar => objPlaceholderChar;

    /// <summary>
    /// Checks if a character at a mask position is a literal (non-editable).
    /// </summary>
    public bool IsLiteral(int position)
    {
        if (position < 0 || position >= objMask.Length)
        {
            return false;
        }

        var maskChar = objMask[position];
        return !IsMaskChar(maskChar);
    }

    /// <summary>
    /// Checks if a character is a mask placeholder character.
    /// </summary>
    public static bool IsMaskChar(char c) => c == '9' || c == 'A' || c == '*';

    /// <summary>
    /// Checks if input character is valid for the mask character at position.
    /// </summary>
    public bool IsValidChar(char input, int position)
    {
        if (position < 0 || position >= objMask.Length)
        {
            return false;
        }

        var maskChar = objMask[position];

        return maskChar switch
        {
            '9' => char.IsDigit(input),
            'A' => char.IsLetter(input),
            '*' => char.IsLetterOrDigit(input),
            _ => input == maskChar // Literal match
        };
    }

    /// <summary>
    /// Gets the next editable position from a given position.
    /// </summary>
    public int GetNextEditablePosition(int position)
    {
        for (var i = position; i < objMask.Length; i++)
        {
            if (IsMaskChar(objMask[i]))
            {
                return i;
            }
        }
        return -1;
    }

    /// <summary>
    /// Gets the previous editable position from a given position.
    /// </summary>
    public int GetPrevEditablePosition(int position)
    {
        for (var i = position - 1; i >= 0; i--)
        {
            if (IsMaskChar(objMask[i]))
            {
                return i;
            }
        }
        return -1;
    }

    /// <summary>
    /// Applies the mask to raw input and returns the formatted value.
    /// </summary>
    public string ApplyMask(string? rawInput)
    {
        if (string.IsNullOrEmpty(rawInput))
        {
            return GetEmptyMask();
        }

        var result = new StringBuilder(objMask.Length);
        var inputIndex = 0;

        for (var maskIndex = 0; maskIndex < objMask.Length; maskIndex++)
        {
            var maskChar = objMask[maskIndex];

            if (IsMaskChar(maskChar))
            {
                // Find next valid input character
                while (inputIndex < rawInput.Length)
                {
                    var inputChar = rawInput[inputIndex++];

                    // Skip any literal characters in the input
                    if (IsValidForMaskChar(inputChar, maskChar))
                    {
                        result.Append(inputChar);
                        break;
                    }
                }

                // If no more input, add placeholder
                if (result.Length <= maskIndex)
                {
                    result.Append(objPlaceholderChar);
                }
            }
            else
            {
                // Literal character
                result.Append(maskChar);

                // Skip matching literal in input
                if (inputIndex < rawInput.Length && rawInput[inputIndex] == maskChar)
                {
                    inputIndex++;
                }
            }
        }

        return result.ToString();
    }

    /// <summary>
    /// Extracts the raw unmasked value.
    /// </summary>
    public string GetUnmaskedValue(string? maskedValue)
    {
        if (string.IsNullOrEmpty(maskedValue))
        {
            return string.Empty;
        }

        var result = new StringBuilder();

        var length = Math.Min(maskedValue.Length, objMask.Length);
        for (var i = 0; i < length; i++)
        {
            var maskChar = objMask[i];
            var valueChar = maskedValue[i];

            if (IsMaskChar(maskChar) && valueChar != objPlaceholderChar)
            {
                result.Append(valueChar);
            }
        }

        return result.ToString();
    }

    /// <summary>
    /// Gets the mask with placeholders.
    /// </summary>
    public string GetEmptyMask()
    {
        var result = new StringBuilder(objMask.Length);

        foreach (var c in objMask)
        {
            result.Append(IsMaskChar(c) ? objPlaceholderChar : c);
        }

        return result.ToString();
    }

    /// <summary>
    /// Checks if an input character is valid for a specific mask character.
    /// </summary>
    private static bool IsValidForMaskChar(char input, char maskChar)
    {
        return maskChar switch
        {
            '9' => char.IsDigit(input),
            'A' => char.IsLetter(input),
            '*' => char.IsLetterOrDigit(input),
            _ => false
        };
    }

    /// <summary>
    /// Processes input and returns the new masked value and cursor position.
    /// </summary>
    public (string Value, int CursorPosition) ProcessInput(string currentValue, string newInput, int cursorPosition)
    {
        // Extract raw characters from new input
        var rawChars = new StringBuilder();
        foreach (var c in newInput)
        {
            if (char.IsLetterOrDigit(c))
            {
                rawChars.Append(c);
            }
        }

        var masked = ApplyMask(rawChars.ToString());

        // Calculate new cursor position
        var newCursorPos = GetNextEditablePosition(0);
        var inputCount = 0;

        for (var i = 0; i < masked.Length && inputCount < rawChars.Length; i++)
        {
            if (IsMaskChar(objMask[i]) && masked[i] != objPlaceholderChar)
            {
                inputCount++;
                newCursorPos = i + 1;
            }
        }

        // Skip to next editable position if on a literal
        if (newCursorPos < objMask.Length && IsLiteral(newCursorPos))
        {
            var nextEdit = GetNextEditablePosition(newCursorPos);
            if (nextEdit >= 0)
            {
                newCursorPos = nextEdit;
            }
        }

        return (masked, newCursorPos);
    }
}
