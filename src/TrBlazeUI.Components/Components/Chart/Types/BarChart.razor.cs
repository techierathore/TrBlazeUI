using ApexCharts;
using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Chart;

/// <summary>
/// A bar chart component that follows the shadcn/ui design system.
/// </summary>
/// <remarks>
/// <para>
/// The BarChart component provides vertical and horizontal bar visualizations
/// with support for grouped and stacked layouts. It integrates with the
/// TrBlazeUI Theme system through CSS custom properties.
/// </para>
/// <para>
/// Features:
/// - 7 variants (Vertical, Horizontal, Stacked, StackedHorizontal, FullStacked, FullStackedHorizontal, Grouped)
/// - Multiple series support
/// - CSS variable theming (--chart-1 through --chart-5)
/// - Interactive tooltips
/// - Responsive design
/// - Dark mode support
/// </para>
/// </remarks>
/// <example>
/// Single series, no child markup - the chart builds the series from Items:
/// <code>
/// &lt;BarChart TItem="SalesData"
///           Items="@salesData"
///           XValue="@(item =&gt; item.Month)"
///           YValue="@(item =&gt; (decimal)item.Desktop)"
///           Height="240px" /&gt;
/// </code>
/// Two or more series - nest ApexPointSeries children, which take over from Items:
/// <code>
/// &lt;BarChart TItem="SalesData"
///           Variant="BarChartVariant.Stacked"&gt;
///     &lt;ApexPointSeries TItem="SalesData"
///                       Items="@salesData"
///                       Name="Desktop"
///                       SeriesType="SeriesType.Bar"
///                       XValue="@(item =&gt; item.Month)"
///                       YValue="@(item =&gt; (decimal)item.Desktop)" /&gt;
///     &lt;ApexPointSeries TItem="SalesData"
///                       Items="@salesData"
///                       Name="Mobile"
///                       SeriesType="SeriesType.Bar"
///                       XValue="@(item =&gt; item.Month)"
///                       YValue="@(item =&gt; (decimal)item.Mobile)" /&gt;
/// &lt;/BarChart&gt;
/// </code>
/// </example>
/// <typeparam name="TItem">The type of data items used in the chart.</typeparam>
public partial class BarChart<TItem> : ChartBase<TItem> where TItem : class
{
    /// <summary>
    /// Gets or sets the bar chart variant.
    /// </summary>
    /// <remarks>
    /// Controls the orientation (vertical/horizontal) and stacking behavior.
    /// Default is <see cref="BarChartVariant.Vertical"/>.
    /// </remarks>
    [Parameter]
    public BarChartVariant Variant { get; set; } = BarChartVariant.Vertical;

    /// <summary>
    /// Gets or sets the series content for the chart.
    /// </summary>
    /// <remarks>
    /// Use ApexPointSeries components to define each data series.
    /// </remarks>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets the corner radius for bars.
    /// </summary>
    /// <remarks>
    /// Adds rounded corners to bar ends. Default is 4 pixels.
    /// </remarks>
    [Parameter]
    public int BorderRadius { get; set; } = 4;

    /// <summary>
    /// Gets or sets the width of bars as a percentage of available space.
    /// </summary>
    /// <remarks>
    /// Value between 0 and 100. Default is 70%.
    /// </remarks>
    [Parameter]
    public int BarWidth { get; set; } = 70;

    private ApexChartOptions<TItem> objOptions = new();

    /// <summary>
    /// Gets the computed CSS classes for the chart container.
    /// </summary>
    private string ContainerCssClass => ClassNames.cn(
        "w-full",
        Class
    );

    /// <summary>
    /// Rebuilds the ApexCharts options whenever parameters are (re)assigned so that
    /// orientation, bar sizing, stacking, and axis styling reflect the current values.
    /// </summary>
    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        ConfigureOptions();
    }

    private void ConfigureOptions()
    {
        objOptions = CreateBaseOptions();

        // Every default below is applied only where the caller's Options left the member unset,
        // so a chart can be steered to match a design without giving up the wrapper (TR-028).

        // Configure bar-specific options
        objOptions.PlotOptions ??= new PlotOptions
        {
            Bar = new PlotOptionsBar
            {
                Horizontal = IsHorizontal(),
                BorderRadius = BorderRadius,
                ColumnWidth = $"{BarWidth}%",
                BarHeight = $"{BarWidth}%"
            }
        };

        // Configure stacking. Applied unconditionally: Variant is the parameter a caller sets to
        // choose it, so the parameter has to win. OptionsConfigurator is the way past this.
        var (stacked, stackType) = GetStackingConfig();
        objOptions.Chart!.Stacked = stacked;
        objOptions.Chart.StackType = stackType;

        // Set colors from config or defaults
        objOptions.Colors ??= ChartColor.DefaultColors.ToList();

        // Grid styling
        objOptions.Grid ??= new ApexCharts.Grid
        {
            BorderColor = "var(--border)",
            StrokeDashArray = 4
        };

        // X-Axis styling
        objOptions.Xaxis ??= new XAxis
        {
            Labels = new XAxisLabels
            {
                Style = new AxisLabelStyle
                {
                    Colors = "var(--muted-foreground)"
                }
            },
            AxisBorder = new AxisBorder
            {
                Show = false
            },
            AxisTicks = new AxisTicks
            {
                Show = false
            }
        };

        // Y-Axis styling
        objOptions.Yaxis ??=
        [
            new YAxis
            {
                Labels = new YAxisLabels
                {
                    Style = new AxisLabelStyle
                    {
                        Colors = "var(--muted-foreground)"
                    }
                }
            }
        ];

        objOptions = FinalizeOptions(objOptions);
    }

    private bool IsHorizontal()
    {
        return Variant is BarChartVariant.Horizontal
            or BarChartVariant.StackedHorizontal
            or BarChartVariant.FullStackedHorizontal;
    }

    private (bool Stacked, StackType? StackType) GetStackingConfig()
    {
        return Variant switch
        {
            BarChartVariant.Stacked or BarChartVariant.StackedHorizontal => (true, ApexCharts.StackType.Normal),
            BarChartVariant.FullStacked or BarChartVariant.FullStackedHorizontal => (true, ApexCharts.StackType.Percent100),
            _ => (false, null)
        };
    }
}
