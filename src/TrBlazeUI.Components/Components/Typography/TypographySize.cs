namespace TrBlazeUI.Components.Typography;

/// <summary>
/// The rendered font size of a Typography component.
/// </summary>
/// <remarks>
/// <para>
/// Setting <c>Size</c> <b>replaces</b> the component's baked-in size classes - including any
/// responsive step such as the <c>lg:text-5xl</c> that <c>TypographyH1</c> carries by default -
/// so the size is a component concern rather than a CSS source-order race between the library's
/// own utility and one passed through <c>Class</c>.
/// </para>
/// </remarks>
public enum TypographySize
{
    /// <summary>Inherit the component's default size (the shadcn/ui type scale).</summary>
    Default = 0,

    /// <summary><c>text-xs</c>.</summary>
    Xs,

    /// <summary><c>text-sm</c>.</summary>
    Sm,

    /// <summary><c>text-base</c>.</summary>
    Base,

    /// <summary><c>text-lg</c>.</summary>
    Lg,

    /// <summary><c>text-xl</c>.</summary>
    Xl,

    /// <summary><c>text-2xl</c>.</summary>
    Xl2,

    /// <summary><c>text-3xl</c>.</summary>
    Xl3,

    /// <summary><c>text-4xl</c>.</summary>
    Xl4,

    /// <summary><c>text-5xl</c>.</summary>
    Xl5,

    /// <summary><c>text-6xl</c>.</summary>
    Xl6
}

/// <summary>
/// Maps <see cref="TypographySize"/> values onto Tailwind font-size utilities.
/// </summary>
public static class TypographySizes
{
    /// <summary>
    /// Gets the Tailwind font-size utility for the supplied size.
    /// </summary>
    /// <param name="aSize">The requested size.</param>
    /// <param name="aDefaultClasses">The component's own size classes, used for <see cref="TypographySize.Default"/>.</param>
    /// <returns>The class string to emit for the font size.</returns>
    public static string? ToClass(TypographySize aSize, string? aDefaultClasses) => aSize switch
    {
        TypographySize.Xs => "text-xs",
        TypographySize.Sm => "text-sm",
        TypographySize.Base => "text-base",
        TypographySize.Lg => "text-lg",
        TypographySize.Xl => "text-xl",
        TypographySize.Xl2 => "text-2xl",
        TypographySize.Xl3 => "text-3xl",
        TypographySize.Xl4 => "text-4xl",
        TypographySize.Xl5 => "text-5xl",
        TypographySize.Xl6 => "text-6xl",
        _ => aDefaultClasses
    };
}
