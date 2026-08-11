// Audits every public Blazor component in the built TrBlazeUI assemblies for a
// [Parameter(CaptureUnmatchedValues = true)] property. Run:
//   dotnet run --project tools/splat-audit -- <dir-with-TrBlazeUI.*.dll>
using System.Reflection;

var vDir = args.Length > 0 ? args[0] : ".";
var vAssemblies = Directory.GetFiles(vDir, "TrBlazeUI.*.dll");
var vRuntime = Directory.GetFiles(Path.GetDirectoryName(typeof(object).Assembly.Location)!, "*.dll");

// The ASP.NET Core shared framework is not next to the component assemblies, so add it explicitly
// - without it the resolver cannot walk ComponentBase and every type lookup fails.
var vSharedRoot = Path.Combine(
    Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(typeof(object).Assembly.Location)!)!)!,
    "Microsoft.AspNetCore.App");
var vAspNet = Directory.Exists(vSharedRoot)
    ? Directory.GetDirectories(vSharedRoot).OrderByDescending(d => d).Take(1).SelectMany(d => Directory.GetFiles(d, "*.dll"))
    : [];

var vAll = vAssemblies
    .Concat(Directory.GetFiles(vDir, "*.dll"))
    .Concat(vRuntime)
    .Concat(vAspNet)
    .GroupBy(Path.GetFileNameWithoutExtension)
    .Select(g => g.First());

var vResolver = new PathAssemblyResolver(vAll);
using var vContext = new MetadataLoadContext(vResolver);

var vTotal = 0;
var vRejects = new List<string>();

foreach (var vPath in vAssemblies)
{
    var vAsm = vContext.LoadFromAssemblyPath(vPath);
    foreach (var vType in vAsm.GetExportedTypes())
    {
        if (vType.IsAbstract || vType.IsInterface) continue;
        if (!vType.GetInterfaces().Any(i => i.FullName == "Microsoft.AspNetCore.Components.IComponent")) continue;

        vTotal++;
        var vHasSplat = false;
        for (var vCurrent = vType; vCurrent != null; vCurrent = vCurrent.BaseType)
        {
            foreach (var vProp in vCurrent.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
            {
                foreach (var vAttr in vProp.GetCustomAttributesData())
                {
                    if (vAttr.AttributeType.FullName != "Microsoft.AspNetCore.Components.ParameterAttribute") continue;
                    if (vAttr.NamedArguments.Any(a => a.MemberName == "CaptureUnmatchedValues" && Equals(a.TypedValue.Value, true)))
                        vHasSplat = true;
                }
            }
        }
        if (!vHasSplat) vRejects.Add(vType.FullName!);
    }
}

Console.WriteLine($"Public component types: {vTotal}");
Console.WriteLine($"WITHOUT CaptureUnmatchedValues: {vRejects.Count}");
foreach (var vName in vRejects.OrderBy(n => n)) Console.WriteLine("  " + vName);
