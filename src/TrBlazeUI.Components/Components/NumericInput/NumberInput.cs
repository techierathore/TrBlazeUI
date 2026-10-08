using System.Numerics;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.NumericInput;

/// <summary>
/// There is no <c>NumberInput</c>. This type exists only so that the natural wrong guess fails the
/// build instead of rendering an invisible element.
/// </summary>
/// <remarks>
/// The namespace is named after its one component, so <c>@using TrBlazeUI.Components.NumericInput</c>
/// followed by <c>&lt;NumberInput TValue="int" /&gt;</c> reads like an ordinary component reference.
/// Razor resolves no such component, treats the tag as unknown HTML, and the page ships a zero-height
/// <c>&lt;numberinput&gt;</c> with a green build (Sevak TR-039). With this type present the same markup
/// is a CS0619 error that names <see cref="NumericInput{TValue}"/>.
/// </remarks>
/// <typeparam name="TValue">The numeric type the caller meant to give <see cref="NumericInput{TValue}"/>.</typeparam>
[Obsolete("There is no NumberInput; use NumericInput<TValue>. The namespace is TrBlazeUI.Components.NumericInput and the component is NumericInput.", error: true)]
public sealed class NumberInput<TValue> : ComponentBase where TValue : struct, INumber<TValue>
{
}
