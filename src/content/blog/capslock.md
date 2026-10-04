---
title: "Remap your Caps-lock to Esc"
description: "Sounds silly advice, but it works"
pubDate: 2026-07-08
---

"Replace your caps lock to ESC bro, your pinky finger will thank u!", told my friend in random engineering chit-chat.

Sounds silly at first, then he add "Just think about when did the last time you use caps lock, it barely used at all!".

Thats a random advice my friend gave me on random night, sounds silly at first, then i give it a try.

Now that im getting used to it, and, i want to write it for you who might find it useful.
Im not coming back, thanks lol.

## Why

I use Esc a lot, especially in vim and tmux. I have small hands, and reaching for it was pretty irritating. Caps Lock is much closer, so pressing it to exit vim insert mode feels natural and fast.

Meanwhile, I barely use Caps Lock. Shift handles the occasional capital letter, and there's a <a href="#fn-1" id="fnref-1">quick command for uppercase text</a>.

I don't have any practical evidence of how this improve my workflow, but my feeling told so. I guess this <a href="#fn-2" id="fnref-2">findings</a> show how caps lock is nearly useless.

## How

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

<hr />

<ol class="footnotes">
<li id="fn-1">
<p>In a macOS or Linux terminal, you can turn text into uppercase with:</p>
<pre><code>echo "your text here" | tr '[:lower:]' '[:upper:]'</code></pre>

<figure>
  <img src="/images/blog/caps-lock-uppercase-example.png" alt="Terminal example converting text to uppercase" />
  <figcaption>Example quick uppercase</figcaption>
</figure>
<a href="#fnref-1" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>

<li id="fn-2">
Caps lock as least used key: https://medium.com/t-superpower/geeks-vs-writers-f81e77a5d3c9

<a href="#fnref-2" class="footnote-backref" aria-label="Back to reference">↩</a>
</li>

</ol>
