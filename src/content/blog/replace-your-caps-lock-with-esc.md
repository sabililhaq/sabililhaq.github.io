---
title: "Replace Your CAPS LOCK with ESC"
description: "Remap your Caps Lock key to ESC."
pubDate: 2026-07-08
---

Remap your Caps Lock key to ESC.

This is one of the silly advice my friend gave me, but it actually became a simple life hack.

### why

- ESC is one of the most frequently used keys (esp. in Vim, tmux, and terminal).
- Caps Lock is basically useless. When was the last time you used it? Too lazy to press Shift? Just use a quick command*
- For me personally (small hands), the distance to ESC was irritating. Now pressing Caps Lock (which is now ESC) feels natural and fast.

### how

- MacOS: Go to **System Settings → Keyboard → Keyboard Shortcuts → Modifier Keys**.

<figure>
  <img src="/images/blog/caps-lock-to-esc-macos.png" alt="" />
  <figcaption>Change Caps Lock to Escape (macOS tahoe 26.2)</figcaption>
</figure>

- Windows:

A bit more steps. Install [**Windows PowerToys**](https://learn.microsoft.com/en-us/windows/powertoys/)** -> Keyboard Manager**

&lt;TODO IMAGE&gt;

(Windows version: Windows 11)

*) You can utilize terminal or similar tools:

```
echo “your text here” | tr ‘[:lower:]’ ‘[:upper:]’
```

<figure>
  <img src="/images/blog/caps-lock-uppercase-example.png" alt="" />
  <figcaption>Example quick uppercase</figcaption>
</figure>
