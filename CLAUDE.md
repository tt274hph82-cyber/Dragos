# Dragos

Video projects live under `videos/<name>/` (HyperFrames); each has its own CLAUDE.md.

## Token guard
- Be concise: outcome first, no recap of what the user just said, no filler.
- Route mechanical work (rename, format, summarize, scrape, bulk find/replace) to the `mechanical` sub-agent (Haiku) instead of doing it in the main session.
- Never suggest /compact as a cost-saving measure. Suggest /clear between unrelated jobs instead.
- Keep the model and effort fixed for the whole session; don't switch mid-session (it invalidates the prompt cache).
- Read files by range (offset/limit, grep) rather than whole, unless the whole file is needed.
