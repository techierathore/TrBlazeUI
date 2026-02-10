#!/usr/bin/env python3
"""Add .ConfigureAwait(false) to all await expressions in src/ library code."""

import re
import os

def should_skip_line(line):
    """Check if this await line should be skipped."""
    stripped = line.strip()
    # Skip comments
    if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('///'):
        return True
    # Skip await InvokeAsync
    if re.search(r'await\s+InvokeAsync\b', line):
        return True
    # Skip await Task.Delay
    if re.search(r'await\s+Task\.Delay\b', line):
        return True
    # Skip await Task.CompletedTask
    if re.search(r'await\s+Task\.CompletedTask', line):
        return True
    # Skip await Task.Yield
    if re.search(r'await\s+Task\.Yield\b', line):
        return True
    # Skip await Task.WhenAny
    if re.search(r'await\s+Task\.WhenAny\b', line):
        return True
    # Already has ConfigureAwait
    if 'ConfigureAwait' in line:
        return True
    return False

def process_line(line):
    """Add .ConfigureAwait(false) to await expression on this line."""
    if 'await ' not in line or should_skip_line(line):
        return line

    # Only process lines that end with );
    stripped = line.rstrip()
    if not stripped.endswith(';'):
        return line

    # Remove trailing semicolon
    before_semi = stripped[:-1].rstrip()

    # Check if we have a balanced expression ending with )
    if not before_semi.endswith(')'):
        return line

    # Find the await keyword position
    await_match = re.search(r'\bawait\s+', line)
    if not await_match:
        return line

    # Check parens are balanced from the await position
    expr_start = await_match.start()
    expr = before_semi[expr_start:]
    open_p = expr.count('(')
    close_p = expr.count(')')

    if open_p != close_p or open_p == 0:
        return line

    # Add .ConfigureAwait(false) before the semicolon
    # Preserve any trailing whitespace/newline
    trailing = line[len(stripped):]
    return before_semi + '.ConfigureAwait(false);' + trailing

def process_file(filepath):
    """Process a single file, return number of changes."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return 0

    if 'await ' not in content:
        return 0

    lines = content.split('\n')
    new_lines = []
    changes = 0

    for line in lines:
        new_line = process_line(line)
        if new_line != line:
            changes += 1
        new_lines.append(new_line)

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))

    return changes

# Walk src/ directory
src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src')
total = 0
files_changed = 0

for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if fname.endswith('.cs') or fname.endswith('.razor'):
            fpath = os.path.join(root, fname)
            n = process_file(fpath)
            if n > 0:
                print(f"  {os.path.relpath(fpath, src_dir)}: {n} changes")
                total += n
                files_changed += 1

print(f"\nTotal: {total} await expressions updated across {files_changed} files")
