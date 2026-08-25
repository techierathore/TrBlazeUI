#!/usr/bin/env bash
# REQ-FN-010: package and clean-consumer deployment smoke for the native Codex agent.
set -euo pipefail

vRepoRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
vArtifactsRoot="${1:-$vRepoRoot/tests/.artifacts/package-codex-agent}"
vPackageRoot="$vArtifactsRoot/packages"
vConsumerRoot="$vArtifactsRoot/consumer"
vPreserveRoot="$vArtifactsRoot/preserve-consumer"
vVersion="9.9.910-smoke"

rm -rf "$vArtifactsRoot"
mkdir -p "$vPackageRoot" "$vConsumerRoot" "$vPreserveRoot"

dotnet pack "$vRepoRoot/src/TrBlazeUI.Primitives/TrBlazeUI.Primitives.csproj" -c Release -o "$vPackageRoot" -p:Version="$vVersion" -p:CI=true
dotnet pack "$vRepoRoot/src/TrBlazeUI.Icons.Lucide/TrBlazeUI.Icons.Lucide.csproj" -c Release -o "$vPackageRoot" -p:Version="$vVersion" -p:CI=true
dotnet pack "$vRepoRoot/src/TrBlazeUI.Components/TrBlazeUI.Components.csproj" -c Release -o "$vPackageRoot" -p:Version="$vVersion" -p:CI=true -p:UsePackageReferences=true -p:RestoreSources="$vPackageRoot"

create_consumer() {
  local aRoot="$1"
  dotnet new classlib --framework net10.0 --no-restore --output "$aRoot"
  # Establish the fixture as its own repository root even when artifacts live beneath this repo.
  printf '%s\n' '<Project />' > "$aRoot/Directory.Build.props"
  dotnet add "$aRoot" package TrBlazeUI.Components --version "$vVersion" --source "$vPackageRoot" --no-restore
}

create_consumer "$vConsumerRoot"
dotnet build "$vConsumerRoot" -c Release -p:RestoreSources="$vPackageRoot" -p:NoWarn=CS1591

vAgent="$vConsumerRoot/.codex/agents/trblazeui.toml"
test -f "$vAgent"
test -f "$vConsumerRoot/.trblazeui/TrBlazeUI-AI-Reference.md"
grep -q '^name = "trblazeui"$' "$vAgent"
grep -q '^developer_instructions = ' "$vAgent"
grep -q '\.trblazeui/TrBlazeUI-AI-Reference.md' "$vAgent"
grep -q 'AGENTS.md' "$vAgent"
if grep -Eq 'ACTIVATION-NOTICE|activation-instructions|/trblazeui|\*help' "$vAgent"; then
  echo "Codex agent contains foreign harness syntax" >&2
  exit 1
fi

create_consumer "$vPreserveRoot"
mkdir -p "$vPreserveRoot/.codex/agents"
printf '%s\n' 'name = "consumer_trblazeui"' > "$vPreserveRoot/.codex/agents/trblazeui.toml"
printf '%s\n' 'keep = true' > "$vPreserveRoot/.codex/config.toml"
printf '%s\n' 'name = "other"' > "$vPreserveRoot/.codex/agents/other.toml"
dotnet build "$vPreserveRoot" -c Release -p:RestoreSources="$vPackageRoot" -p:NoWarn=CS1591
grep -q '^name = "consumer_trblazeui"$' "$vPreserveRoot/.codex/agents/trblazeui.toml"
grep -q '^keep = true$' "$vPreserveRoot/.codex/config.toml"
grep -q '^name = "other"$' "$vPreserveRoot/.codex/agents/other.toml"
test ! -e "$vPreserveRoot/.trblazeui/.codex-agent-package-owned"

echo "REQ-FN-010 package deployment smoke passed"
