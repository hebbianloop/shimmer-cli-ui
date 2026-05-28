// "shimmer" wordmark — pyfiglet "double_blocky" font, character vocabulary
// (█ ▀ ▄ ░) chosen to match opencode's original half-block aesthetic. The
// split puts "shim" on the dim/left half and "mer" on the bright/right half
// to preserve the 3D layering the TUI logo component relies on.
export const logo = {
  left: [
    "               ",
    " █▀ █░░ ▀ ▄▀▄▀▄",
    " ▄█ █▀█ █ █░▀░█",
  ],
  right: [
    "             ",
    "▄▀▄▀▄ ██▀ █▀▄",
    "█░▀░█ █▄▄ █▀▄",
  ],
}

// Compact mark used in the exit splash via `go.right.slice(1)`. Renders as a
// small "s" + "h" pair, keeping the 4-row structure so slice(1) yields three
// visible rows the same way the original "go" did.
export const go = {
  left: ["    ", " █▀ ", " ▄█ ", "    "],
  right: ["    ", "█░░ ", "█▀█ ", "    "],
}

export const marks = "_^~,"
