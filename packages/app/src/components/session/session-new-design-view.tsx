import type { JSX } from "solid-js"
import { For } from "solid-js"
import { WordmarkV2 } from "@opencode-ai/ui/v2/components/wordmark-v2.jsx"

// Starter chips shown on the empty Studio surface — concrete suggestions for
// non-developer power users (the "Claude Code addictive loop, translated").
// Clicking dispatches a custom event the prompt input can listen for; until
// that listener is wired the chips remain useful as visible affordances.
const STARTERS = [
  "Synthesize a folder of PDFs into a 3-page brief",
  "Draft a speech, op-ed, or memo",
  "Find what I said about a topic across everything",
  "Research a question and cite the sources",
]

function fillPrompt(text: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("studio:starter", { detail: { text } }))
}

export function NewSessionDesignView(props: { children: JSX.Element }) {
  return (
    <div data-component="session-new-design" class="relative size-full overflow-hidden bg-v2-background-bg-deep">
      <div class="absolute inset-x-0 top-[25.375%] flex justify-center px-6">
        <div class="w-full max-w-[720px]">
          <WordmarkV2 class="h-auto w-full text-v2-icon-icon-base" />
          <div class="mt-8">{props.children}</div>
          <div class="mt-6 flex flex-wrap gap-2 justify-center">
            <For each={STARTERS}>
              {(text) => (
                <button
                  type="button"
                  onClick={() => fillPrompt(text)}
                  class="rounded-full border border-v2-border-border-subtle bg-v2-background-bg-base/40 px-3 py-1.5 text-[12px] text-v2-text-text-secondary transition-colors hover:border-v2-border-border-base hover:bg-v2-background-bg-base hover:text-v2-text-text-primary"
                >
                  {text}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}
