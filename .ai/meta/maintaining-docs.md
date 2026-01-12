# Maintaining AI Documentation

## Purpose

This documentation helps AI assistants (Claude, Cursor, Copilot, etc.) understand and work with the McBroken codebase effectively.

## Documentation Structure

```
.ai/
├── README.md                    # Navigation hub & quick reference
├── core/                        # Foundational knowledge
│   ├── project-overview.md      # What McBroken does
│   ├── technology-stack.md      # Versions & dependencies (SSOT)
│   ├── application-architecture.md  # System design
│   └── deployment-architecture.md   # Infrastructure
├── development/                 # Day-to-day development
│   ├── development-workflow.md  # Setup & commands
│   ├── testing-patterns.md      # Testing approach
│   └── common-tasks.md          # Frequent tasks
├── patterns/                    # Code patterns
│   ├── database-patterns.md     # Prisma & PostgreSQL
│   ├── frontend-patterns.md     # Next.js, React
│   ├── serverless-patterns.md   # Lambda, Serverless
│   └── code-conventions.md      # Naming, imports
└── meta/
    └── maintaining-docs.md      # This file
```

## Single Source of Truth (SSOT)

**Critical**: Version numbers and technology specifications live ONLY in `core/technology-stack.md`.

Do not duplicate version numbers in other files. Reference the technology stack file instead.

**Wrong**:
```markdown
<!-- In some-other-file.md -->
We use Next.js 15.5.9 and React 19.1.0...
```

**Correct**:
```markdown
<!-- In some-other-file.md -->
See `core/technology-stack.md` for exact versions.
```

## When to Update Documentation

### Must Update

- **Dependency updates**: Update `technology-stack.md`
- **Architecture changes**: Update relevant architecture file
- **New patterns**: Add to patterns directory
- **New commands**: Add to `development-workflow.md`

### Consider Updating

- **New common tasks**: Add to `common-tasks.md`
- **Gotchas discovered**: Add to relevant patterns file
- **New region/country**: Update project overview and architecture

## Update Checklist

When making significant code changes:

1. [ ] Update `technology-stack.md` if dependencies changed
2. [ ] Update architecture docs if structure changed
3. [ ] Update patterns if new patterns introduced
4. [ ] Update common-tasks if new workflows needed
5. [ ] Verify CLAUDE.md and .cursorrules still accurate

## Entry Points

| File | Purpose | Update When |
|------|---------|-------------|
| `CLAUDE.md` | Claude Code entry | Quick reference changes |
| `.cursorrules` | Cursor entry | Rules or patterns change |
| `.ai/README.md` | Navigation hub | Structure changes |

## Writing Guidelines

### Be Specific

```markdown
<!-- ❌ Vague -->
Use the right database patterns.

<!-- ✅ Specific -->
Use Prisma's `upsert` for create-or-update operations.
See `patterns/database-patterns.md` for examples.
```

### Include Examples

```markdown
<!-- ❌ No example -->
Create React Query hooks for data fetching.

<!-- ✅ With example -->
Create React Query hooks for data fetching:
\`\`\`typescript
export const useMcData = () => {
  return useQuery({
    queryKey: ['mcData'],
    queryFn: fetchMcData,
  });
};
\`\`\`
```

### Use Decision Trees

```markdown
**What do you need?**
- Setting up dev environment? → `development-workflow.md`
- Writing database queries? → `patterns/database-patterns.md`
- Adding a new feature? → `common-tasks.md`
```

## Testing Documentation

After updates, verify:

1. Navigation links work
2. Code examples are correct
3. Commands are runnable
4. File paths are accurate

## Keeping Current

Schedule regular reviews:

- **Monthly**: Check version numbers match `package.json`
- **After major PRs**: Review affected documentation
- **Quarterly**: Full documentation audit
