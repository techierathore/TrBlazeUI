namespace TrBlazeUI.Components.DateRangePicker;

/// <summary>
/// Represents a date range with start and end dates.
/// </summary>
/// <param name="Start">The start date of the range.</param>
/// <param name="End">The end date of the range.</param>
public record DateRange(DateTime Start, DateTime End)
{
    /// <summary>
    /// Gets the number of days in the range (inclusive).
    /// </summary>
    public int Days => (End.Date - Start.Date).Days + 1;

    /// <summary>
    /// Checks if a date is within the range.
    /// </summary>
    public bool Contains(DateTime date) => date.Date >= Start.Date && date.Date <= End.Date;

    /// <summary>
    /// Creates a DateRange ensuring Start is before End.
    /// </summary>
    public static DateRange Create(DateTime date1, DateTime date2)
    {
        return date1 <= date2
            ? new DateRange(date1.Date, date2.Date)
            : new DateRange(date2.Date, date1.Date);
    }
}

/// <summary>
/// Preset date range options.
/// </summary>
public enum DateRangePreset
{
    /// <summary>The current day.</summary>
    Today,
    /// <summary>The previous day.</summary>
    Yesterday,
    /// <summary>The last 7 days ending today.</summary>
    Last7Days,
    /// <summary>The last 30 days ending today.</summary>
    Last30Days,
    /// <summary>The current calendar month.</summary>
    ThisMonth,
    /// <summary>The previous calendar month.</summary>
    LastMonth,
    /// <summary>The current calendar year.</summary>
    ThisYear,
    /// <summary>A user-defined custom range.</summary>
    Custom
}
