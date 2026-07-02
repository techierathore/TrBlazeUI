using ApexCharts;
using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Chart;

/// <summary>
/// An area chart component that follows the shadcn/ui design system.
/// </summary>
/// <remarks>
/// <para>
/// The AreaChart component provides area-based visualizations that emphasize
/// volume or magnitude. It supports stacking for part-to-whole comparisons
/// and integrates with the TrBlazeUI Theme system.
/// </para>
/// <para>
/// Features:
/// - 4 variants (Default, Spline, Stacked, Stepline)
/// - Multiple series support with gradient fills
/// - CSS variable theming (--chart-1 through --chart-5)
/// - Interactive tooltips
/// - Dark mode support
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;AreaChart TItem="RevenueData"
///            Items="@revenueData"
///            Variant="AreaChartVariant.Stacked"&gt;
///     &lt;ApexPointSeries TItem="RevenueData"
///                      Items="@revenueData"
///                      Name="Product A"
///                      SeriesType="SeriesType.Area"
///                      XValue="@(item => item.Month)"
///                      YValue="@(item => item.ProductA)" /&gt;
/// &lt;/AreaChart&gt;
/// </code>
/// </example>
/// <typeparam name="TItem">The type of data items used in the chart.</typeparam>
public partial class AreaChart<TItem> : ChartBase<TItem> where TItem : class
{
    /// <summary>
    /// Gets or sets the area chart variant.
    /// </summary>
    /// <remarks>
    /// Controls the line interpolation style and stacking behavior.
    /// Default is <see cref="AreaChartVariant.Default"/>.
    /// </remarks>
    [Parameter]
    public AreaChartVariant Variant { get; set; } = AreaChartVariant.Default;

    /// <summary>
    /// Gets or sets the series content for the chart.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets the line stroke width.
    /// </summary>
    /// <remarks>
    /// Width of the area border line in pixels. Default is 2.
    /// </remarks>
    [Parameter]
    public int StrokeWidth { get; set; } = 2;

    /// <summary>
    /// Gets or sets the fill opacity.
    /// </summary>
    /// <remarks>
    /// Opacity of the area fill (0.0 to 1.0). Default is 0.4.
    /// </remarks>
    [Parameter]
    public double FillOpacity { get; set; } = 0.4;

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
    /// variant, stroke, fill, stacking, and axis styling reflect the current values.
    /// </summary>
    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        ConfigureOptions();
    }

    private void ConfigureOptions()
    {
        objOptions = CreateBaseOptions();

        // Configure stroke based on variant
        objOptions.Stroke = new Stroke
        {
            Curve = GetCurveType(),
            Width = StrokeWidth
        };

        // Configure fill with gradient
        objOptions.Fill = new Fill
        {
            Type = FillType.Gradient,
            Gradient = new FillGradient
            {
                ShadeIntensity = 1,
                OpacityFrom = FillOpacity,
                OpacityTo = 0.1,
                Stops = [0, 90, 100]
            }
        };

        // Configure stacking for stacked variant
        if (Variant == AreaChartVariant.Stacked)
        {
            objOptions.Chart!.Stacked = true;
            objOptions.Chart.StackType = StackType.Normal;
        }

        // Set colors from config or defaults
        objOptions.Colors = ChartColor.DefaultColors.ToList();

        // Grid styling
        objOptions.Grid = new ApexCharts.Grid
        {
            BorderColor = "var(--border)",
            StrokeDashArray = 4
        };

        // X-Axis styling
        objOptions.Xaxis = new XAxis
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
        objOptions.Yaxis =
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
    }

    private Curve GetCurveType()
    {
        return Variant switch
        {
            AreaChartVariant.Spline => Curve.Smooth,
            AreaChartVariant.Stepline => Curve.Stepline,
            _ => Curve.Straight
        };
    }
}
