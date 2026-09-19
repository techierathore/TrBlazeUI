namespace TrBlazeUI.Components.DiffView;

/// <summary>
/// Compares two texts line by line in .NET, with no script library, and groups the result into
/// parts (hunks) the way <c>git diff</c> does.
/// </summary>
/// <remarks>
/// The comparison is Myers' O(ND) shortest-edit algorithm, run on the lines left after the common
/// first and last lines are set aside, so a small edit to a large file costs little. Within each
/// run of changes the removed lines are listed before the added lines that replace them.
/// </remarks>
public static class TextDiff
{
    /// <summary>
    /// The largest number of changed lines the shortest-edit search explores. Beyond it the middle
    /// of the two texts is shown as removed and then added in full, which keeps memory bounded
    /// (about 4 MB) when two unrelated texts are compared.
    /// </summary>
    public const int MaxEditDistance = 1000;

    /// <summary>
    /// Compares two texts line by line.
    /// </summary>
    /// <remarks>
    /// Steps: split both texts into lines (<c>\r\n</c>, <c>\r</c> and <c>\n</c> all end a line, and
    /// a final line break adds no empty line); build the comparison keys; find the shortest edit;
    /// number the lines.
    /// </remarks>
    /// <param name="aBefore">The before text. Null is treated as empty.</param>
    /// <param name="aAfter">The after text. Null is treated as empty.</param>
    /// <param name="aIgnoreWhitespace">True to treat lines that differ only in whitespace as unchanged.</param>
    /// <returns>Every line of both texts, in display order.</returns>
    public static IReadOnlyList<DiffLine> Compare(string? aBefore, string? aAfter, bool aIgnoreWhitespace = false)
    {
        var vOld = SplitLines(aBefore);
        var vNew = SplitLines(aAfter);
        var vOps = FindEdits(ToKeys(vOld, aIgnoreWhitespace), ToKeys(vNew, aIgnoreWhitespace));
        return Number(vOld, vNew, GroupRuns(vOps));
    }

    /// <summary>
    /// Groups compared lines into parts: each run of changes with up to
    /// <paramref name="aContextLines"/> unchanged lines on either side. Parts whose context would
    /// touch or overlap are merged.
    /// </summary>
    /// <param name="aLines">The lines returned by <see cref="Compare"/>.</param>
    /// <param name="aContextLines">Unchanged lines kept around each change; a negative value keeps all.</param>
    /// <returns>The parts, empty when the texts are the same.</returns>
    public static IReadOnlyList<DiffHunk> Hunks(IReadOnlyList<DiffLine> aLines, int aContextLines)
    {
        var vContext = aContextLines < 0 ? aLines.Count : aContextLines;
        var vRanges = ChangeRanges(aLines, vContext);
        return vRanges.Select((r, i) => MakeHunk(aLines, r.Start, r.End, i)).ToList();
    }

    /// <summary>
    /// Splits a text into lines without their line breaks.
    /// </summary>
    /// <param name="aText">The text. Null or empty gives no lines.</param>
    /// <returns>The lines.</returns>
    public static string[] SplitLines(string? aText)
    {
        if (string.IsNullOrEmpty(aText))
        {
            return [];
        }

        var vLines = aText.Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n')
            .Split('\n');
        return vLines[^1].Length == 0 ? vLines[..^1] : vLines;
    }

    private static string[] ToKeys(string[] aLines, bool aIgnoreWhitespace) =>
        aIgnoreWhitespace
            ? aLines.Select(l => string.Concat(l.Where(c => !char.IsWhiteSpace(c)))).ToArray()
            : aLines;

    private static List<DiffLineKind> FindEdits(string[] aOld, string[] aNew)
    {
        var vPrefix = 0;
        while (vPrefix < aOld.Length && vPrefix < aNew.Length && aOld[vPrefix] == aNew[vPrefix])
        {
            vPrefix++;
        }

        var vSuffix = 0;
        while (vSuffix < aOld.Length - vPrefix && vSuffix < aNew.Length - vPrefix
               && aOld[aOld.Length - 1 - vSuffix] == aNew[aNew.Length - 1 - vSuffix])
        {
            vSuffix++;
        }

        var vOldMiddle = aOld[vPrefix..(aOld.Length - vSuffix)];
        var vNewMiddle = aNew[vPrefix..(aNew.Length - vSuffix)];
        var vMiddle = ShortestEdit(vOldMiddle, vNewMiddle) ?? ReplaceAll(vOldMiddle.Length, vNewMiddle.Length);

        var vOps = new List<DiffLineKind>(vPrefix + vMiddle.Count + vSuffix);
        vOps.AddRange(Enumerable.Repeat(DiffLineKind.Unchanged, vPrefix));
        vOps.AddRange(vMiddle);
        vOps.AddRange(Enumerable.Repeat(DiffLineKind.Unchanged, vSuffix));
        return vOps;
    }

    private static List<DiffLineKind> ReplaceAll(int aOldCount, int aNewCount)
    {
        var vOps = new List<DiffLineKind>(aOldCount + aNewCount);
        vOps.AddRange(Enumerable.Repeat(DiffLineKind.Removed, aOldCount));
        vOps.AddRange(Enumerable.Repeat(DiffLineKind.Added, aNewCount));
        return vOps;
    }

    /// <summary>
    /// Myers' greedy forward search. <c>V[k]</c> holds the furthest x reached on diagonal
    /// k = x - y; a copy of the diagonals -d..d is kept before each step d so the path can be
    /// walked back. Returns null when more than <see cref="MaxEditDistance"/> edits are needed.
    /// </summary>
    private static List<DiffLineKind>? ShortestEdit(string[] aOld, string[] aNew)
    {
        var vMax = aOld.Length + aNew.Length;
        if (vMax == 0)
        {
            return [];
        }

        var vOffset = vMax + 1;
        var vV = new int[(2 * vMax) + 3];
        var vTrace = new List<int[]>();
        for (var vD = 0; vD <= Math.Min(vMax, MaxEditDistance); vD++)
        {
            vTrace.Add(Snapshot(vV, vOffset, vD));
            if (Step(aOld, aNew, vV, vOffset, vD))
            {
                return Backtrack(vTrace, aOld.Length, aNew.Length);
            }
        }

        return null;
    }

    private static int[] Snapshot(int[] aV, int aOffset, int aD)
    {
        var vCopy = new int[(2 * aD) + 1];
        Array.Copy(aV, aOffset - aD, vCopy, 0, vCopy.Length);
        return vCopy;
    }

    private static bool Step(string[] aOld, string[] aNew, int[] aV, int aOffset, int aD)
    {
        for (var vK = -aD; vK <= aD; vK += 2)
        {
            var vDown = vK == -aD || (vK != aD && aV[aOffset + vK - 1] < aV[aOffset + vK + 1]);
            var vX = vDown ? aV[aOffset + vK + 1] : aV[aOffset + vK - 1] + 1;
            var vY = vX - vK;
            while (vX < aOld.Length && vY < aNew.Length && aOld[vX] == aNew[vY])
            {
                vX++;
                vY++;
            }

            aV[aOffset + vK] = vX;
            if (vX >= aOld.Length && vY >= aNew.Length)
            {
                return true;
            }
        }

        return false;
    }

    private static List<DiffLineKind> Backtrack(List<int[]> aTrace, int aOldCount, int aNewCount)
    {
        var vOps = new List<DiffLineKind>();
        var vX = aOldCount;
        var vY = aNewCount;
        for (var vD = aTrace.Count - 1; vD > 0; vD--)
        {
            var vPrev = aTrace[vD];
            var vK = vX - vY;
            var vDown = vK == -vD || (vK != vD && vPrev[vK - 1 + vD] < vPrev[vK + 1 + vD]);
            var vPrevK = vDown ? vK + 1 : vK - 1;
            var vPrevX = vPrev[vPrevK + vD];
            var vPrevY = vPrevX - vPrevK;
            for (; vX > vPrevX && vY > vPrevY; vX--, vY--)
            {
                vOps.Add(DiffLineKind.Unchanged);
            }

            vOps.Add(vX == vPrevX ? DiffLineKind.Added : DiffLineKind.Removed);
            vX = vPrevX;
            vY = vPrevY;
        }

        vOps.AddRange(Enumerable.Repeat(DiffLineKind.Unchanged, vX));
        vOps.Reverse();
        return vOps;
    }

    private static List<DiffLineKind> GroupRuns(List<DiffLineKind> aOps)
    {
        var vResult = new List<DiffLineKind>(aOps.Count);
        var vRemoved = 0;
        var vAdded = 0;
        foreach (var vOp in aOps.Append(DiffLineKind.Unchanged))
        {
            if (vOp != DiffLineKind.Unchanged)
            {
                vRemoved += vOp == DiffLineKind.Removed ? 1 : 0;
                vAdded += vOp == DiffLineKind.Added ? 1 : 0;
                continue;
            }

            vResult.AddRange(ReplaceAll(vRemoved, vAdded));
            vResult.Add(DiffLineKind.Unchanged);
            vRemoved = 0;
            vAdded = 0;
        }

        vResult.RemoveAt(vResult.Count - 1);
        return vResult;
    }

    private static List<DiffLine> Number(string[] aOld, string[] aNew, List<DiffLineKind> aOps)
    {
        var vLines = new List<DiffLine>(aOps.Count);
        var vI = 0;
        var vJ = 0;
        foreach (var vOp in aOps)
        {
            vLines.Add(vOp switch
            {
                DiffLineKind.Removed => new DiffLine { Kind = vOp, OldNumber = vI + 1, Text = aOld[vI] },
                DiffLineKind.Added => new DiffLine { Kind = vOp, NewNumber = vJ + 1, Text = aNew[vJ] },
                _ => new DiffLine { Kind = vOp, OldNumber = vI + 1, NewNumber = vJ + 1, Text = aNew[vJ] }
            });
            vI += vOp == DiffLineKind.Added ? 0 : 1;
            vJ += vOp == DiffLineKind.Removed ? 0 : 1;
        }

        return vLines;
    }

    private static List<(int Start, int End)> ChangeRanges(IReadOnlyList<DiffLine> aLines, int aContext)
    {
        var vRanges = new List<(int Start, int End)>();
        for (var vI = 0; vI < aLines.Count; vI++)
        {
            if (aLines[vI].Kind == DiffLineKind.Unchanged)
            {
                continue;
            }

            var vStart = Math.Max(0, vI - aContext);
            var vEnd = (int)Math.Min(aLines.Count - 1L, (long)vI + aContext);
            if (vRanges.Count > 0 && vStart <= vRanges[^1].End + 1)
            {
                vRanges[^1] = (vRanges[^1].Start, Math.Max(vRanges[^1].End, vEnd));
            }
            else
            {
                vRanges.Add((vStart, vEnd));
            }
        }

        return vRanges;
    }

    private static DiffHunk MakeHunk(IReadOnlyList<DiffLine> aLines, int aStart, int aEnd, int aIndex)
    {
        var vSlice = aLines.Skip(aStart).Take(aEnd - aStart + 1).ToList();
        var vOldBefore = aLines.Take(aStart).Count(l => l.Kind != DiffLineKind.Added);
        var vNewBefore = aLines.Take(aStart).Count(l => l.Kind != DiffLineKind.Removed);
        var vOldCount = vSlice.Count(l => l.Kind != DiffLineKind.Added);
        var vNewCount = vSlice.Count(l => l.Kind != DiffLineKind.Removed);
        return new DiffHunk
        {
            Index = aIndex,
            StartIndex = aStart,
            EndIndex = aEnd,
            OldStart = vOldCount > 0 ? vOldBefore + 1 : vOldBefore,
            OldCount = vOldCount,
            NewStart = vNewCount > 0 ? vNewBefore + 1 : vNewBefore,
            NewCount = vNewCount,
            Lines = vSlice
        };
    }
}
