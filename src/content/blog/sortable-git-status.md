---
title: "Sortable git status"
description: "I use this a lot when orchestrating an agent, but need to cherry-pick the changes I need to add."
pubDate: 2026-08-16
---

When running an AI agent, I often get into this situation:

Agent changes a lot of files, then I need to nitpick all their changes (`git add`).

At the same time, I got a lot of irrelevant changes that I forgot to stash, or any old files I won't care in a particular session.

This command saves me:

```bash
(
  git diff --name-only
  git diff --cached --name-only
  git ls-files --others --exclude-standard
) | sort -u | while read -r f; do [ -e "$f" ] && echo "$f"; done \
| xargs -I{} stat -f "%Sm %N" -t "%d %b %H:%M" {} \
| sort -r
```

Basically it runs the git diff stuff, then sorts by last changed.

I don't think VSCode has this capability.

I use it a lot when orchestrating an agent, but need to cherry-pick the changes I need to add.

You could use it as an alias if you might use it often. Add it to your `~/.bashrc` or `~/.zshrc`:

```bash
gls () {
  (
    git diff --name-only
    git diff --cached --name-only
    git ls-files --others --exclude-standard
  ) | sort -u | while read -r f; do [ -e "$f" ] && echo "$f"; done \
  | xargs -I{} stat -f "%Sm %N" -t "%d %b %H:%M" {} \
  | sort -r
}
```

Example usage:

<figure>
	<img src="/images/blog/sortable-git-status.png" alt="Left: git status. Right: gls, with files sorted by last changed time." />
	<figcaption>Left: git status. Right: gls. I can see irrelevant files to be added (in this case, .codegraph/.gitignore).</figcaption>
</figure>
