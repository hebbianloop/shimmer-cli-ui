/**
 * Typed auto-memory plugin (port of Claude Code's memory subsystem).
 *
 * Loads a per-project `MEMORY.md` index + the writing-guide into the system
 * prompt at session start. Memories are markdown files with YAML frontmatter:
 *
 *   ---
 *   name: short-kebab-slug
 *   description: one-line summary
 *   metadata:
 *     type: user | feedback | project | reference
 *   ---
 *   <memory body>
 *
 * The agent manages memory files using the existing Read / Write / Edit tools;
 * no new tools are required.
 */
import type { Plugin } from "@opencode-ai/plugin"
import { promises as fs } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export const MEMORY_ROOT = process.env.SHIMMER_MEMORY_ROOT ?? join(homedir(), ".shimmer-cli", "projects")
export const INDEX_FILENAME = "MEMORY.md"
const INDEX_TRUNCATE_LINES = 200

export function projectKey(directory: string): string {
  // Mirror Claude Code's slashified-path convention: /Users/shady → -Users-shady.
  return directory.replace(/[\\/]+/g, "-")
}

export function memoryDir(directory: string): string {
  return join(MEMORY_ROOT, projectKey(directory), "memory")
}

async function readIndex(dir: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(join(dir, INDEX_FILENAME), "utf8")
    const lines = raw.split("\n").slice(0, INDEX_TRUNCATE_LINES)
    return lines.join("\n").trimEnd()
  } catch {
    return null
  }
}

function buildSystemSection(dir: string, index: string | null): string {
  const header = `# auto memory

Persistent memory directory: \`${dir}\`
Index file: \`${join(dir, INDEX_FILENAME)}\` (this file). Each entry points at a sibling \`*.md\` memory file with frontmatter.`

  const usage = `## How to save a memory

1. Write the memory body to \`<slug>.md\` in the memory directory with frontmatter:

\`\`\`markdown
---
name: {short-kebab-slug}
description: {one-line summary — what this memory captures}
metadata:
  type: {user | feedback | project | reference}
---

{memory body — for feedback/project, include **Why:** and **How to apply:** lines}
\`\`\`

2. Add a one-line pointer to \`MEMORY.md\`: \`- [Title](file.md) — one-line hook\`.

Keep \`MEMORY.md\` under ${INDEX_TRUNCATE_LINES} lines. Update or remove memories that turn out wrong; before recommending from memory, verify the current state.

## Types
- **user** — who the user is, their role, preferences, knowledge
- **feedback** — guidance the user has given (corrections AND confirmations)
- **project** — ongoing work, deadlines, motivations not in git
- **reference** — pointers to external systems (Linear projects, dashboards, etc.)`

  const indexBlock = index
    ? `## Current index (${INDEX_FILENAME})\n\n${index}`
    : `## Current index\n\n_(empty — no memories saved yet for this project)_`

  return [header, indexBlock, usage].join("\n\n")
}

export const MemoryPlugin: Plugin = async (input) => {
  const dir = memoryDir(input.directory)

  return {
    "experimental.chat.system.transform": async (_inp, output) => {
      // No-op until the user bootstraps by creating MEMORY.md. This keeps
      // ephemeral test cwds (and fresh installs) from mutating the system
      // prompt — which would otherwise break recorded-fixture LLM tests.
      const index = await readIndex(dir)
      if (!index) return
      const section = buildSystemSection(dir, index)
      if (process.env.SHIMMER_MEMORY_DEBUG === "1") {
        // eslint-disable-next-line no-console
        console.error("[memory-plugin] section:\n" + section)
      }
      output.system.push(section)
    },
  }
}
