---
title: "Remap your Caps Lock to Esc"
description: "Sounds like silly advice, but it works."
pubDate: 2026-10-04
---
"Remap your Caps Lock to Esc, bro. Your pinky finger will thank u!" my friend said during some random engineering chit-chat.

It sounded silly at first. Then he added, "When was the last time you used Caps Lock?"

Fair point. I gave it a try, and now that I'm used to it, I'm not coming back. Thanks lol.

## Why
I use Esc a lot, especially in <a href="/vim" target="_blank" rel="noopener noreferrer">vim</a> and tmux. I have small hands, and reaching for it was pretty awkward. Caps Lock is much closer, so pressing it to exit vim insert mode feels natural and fast.

Meanwhile, I never use Caps Lock. Shift is enough for capital letters, and there's a quick command<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" aria-label="Footnote 1">1</a></sup> for converting whole chunks of text to uppercase. A small team's experiment<sup class="footnote-ref"><a href="#fn-2" id="fnref-2" aria-label="Footnote 2">2</a></sup> also found Caps Lock was among their least-used keys.

I haven't measured whether this makes me faster. It just feels more comfortable.

<details class="post-instructions">
<summary>How (MacOS &amp; Windows)</summary>

### macOS

Go to **System Settings → Keyboard → Keyboard Shortcuts → Modifier Keys**. Select your keyboard, change **Caps Lock** to **Escape**, then click **Done**.

<figure>
  <img src="/images/blog/caps-lock-to-esc-macos.png" alt="macOS Modifier Keys settings with Caps Lock mapped to Escape" />
  <figcaption>Change Caps Lock to Escape (macOS Tahoe 26.2)</figcaption>
</figure>

### Windows

On Windows 11, install [Windows PowerToys](https://learn.microsoft.com/en-us/windows/powertoys/), then:

1. Open **PowerToys → Keyboard Manager** and enable it.
2. Select **Remap a key**, then add a key remapping.
3. Set the input key to **Caps Lock** and the output key to **Esc**.
4. Click **OK**. If a warning says Caps Lock has no assignment, confirm to continue.

Keep PowerToys running in the background for the remapping to work. See the [Keyboard Manager guide](https://learn.microsoft.com/en-us/windows/powertoys/keyboard-manager) for details.

</details>

<hr />

<ol class="footnotes">
<li id="fn-1">
<p>In a macOS or Linux terminal, you can turn text into uppercase with:</p>
<pre tabindex="0" aria-label="Uppercase text command"><code>echo "your text here" | tr '[:lower:]' '[:upper:]'</code></pre>

<figure>
  <img src="/images/blog/caps-lock-uppercase-example.png" alt="Terminal example converting text to uppercase" />
  <figcaption>Example quick uppercase</figcaption>
</figure>
<a href="#fnref-1" class="footnote-backref" aria-label="Back to reference 1">↩</a>
</li>

<li id="fn-2">
<a href="https://medium.com/t-superpower/geeks-vs-writers-f81e77a5d3c9">Geeks vs. Writers</a>: an experiment in keyboard usage.

<a href="#fnref-2" class="footnote-backref" aria-label="Back to reference 2">↩</a>
</li>

</ol>
