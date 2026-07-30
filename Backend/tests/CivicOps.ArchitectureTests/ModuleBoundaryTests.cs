using System.Reflection;

namespace CivicOps.ArchitectureTests;

public sealed class ModuleBoundaryTests
{
    private static readonly string[] ModuleAssemblyNames =
    [
        "CivicOps.Modules.IdentityAccess.Core",
        "CivicOps.Modules.IdentityAccess.Infrastructure",
        "CivicOps.Modules.Notifications.Application",
        "CivicOps.Modules.Notifications.Domain",
        "CivicOps.Modules.Notifications.Infrastructure",
        "CivicOps.Modules.Notifications.Presentation",
        "CivicOps.Modules.Requests.Application",
        "CivicOps.Modules.Requests.Domain",
        "CivicOps.Modules.Requests.Infrastructure",
        "CivicOps.Modules.Requests.Presentation"
    ];

    private static readonly HashSet<string> AllowedCrossModuleEdges =
    [
        "CivicOps.Modules.Requests.Application"
        + " -> CivicOps.Modules.IdentityAccess.Core"
    ];

    [Fact]
    public void CrossModuleDependencies_ShouldUseExplicitContracts()
    {
        var actualEdges = ModuleAssemblyNames
            .Select(Assembly.Load)
            .SelectMany(assembly =>
            {
                var source = AssemblyNameOf(assembly);
                var sourceModule = ModuleNameOf(source);

                return assembly.GetReferencedAssemblies()
                    .Select(reference => reference.Name)
                    .OfType<string>()
                    .Where(reference =>
                        reference.StartsWith(
                            "CivicOps.Modules.",
                            StringComparison.Ordinal)
                        && ModuleNameOf(reference) != sourceModule)
                    .Select(reference => $"{source} -> {reference}");
            })
            .ToHashSet(StringComparer.Ordinal);

        var unexpectedEdges = actualEdges
            .Except(AllowedCrossModuleEdges)
            .Order()
            .ToArray();

        var missingEdges = AllowedCrossModuleEdges
            .Except(actualEdges)
            .Order()
            .ToArray();

        Assert.True(
            unexpectedEdges.Length == 0,
            "Dependências entre módulos sem contrato aprovado: "
            + string.Join(", ", unexpectedEdges));
        Assert.True(
            missingEdges.Length == 0,
            "O contrato entre módulos deixou de ser exercido: "
            + string.Join(", ", missingEdges));
    }

    private static string AssemblyNameOf(Assembly assembly) =>
        assembly.GetName().Name
        ?? throw new InvalidOperationException("Assembly sem nome.");

    private static string ModuleNameOf(string assemblyName)
    {
        var parts = assemblyName.Split('.');
        return parts.Length >= 3
            ? parts[2]
            : throw new InvalidOperationException(
                $"Assembly fora do padrão de módulos: {assemblyName}");
    }
}
