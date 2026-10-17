# Stabilo demo assets

`content.js` and `content.css` were copied from
https://github.com/sabililhaq/stabilo at commit
`050fbcee0209891a37522e0886443309e6ca0183` (extension version 0.1.4).

Local demo changes: the marker follows the horizontal pointer position below
the selected line; keyboard selection still uses the selection endpoint.
The removal notification dismisses automatically after four seconds.
Preserve these changes when updating from upstream.

Only `/stabilo` loads them. To update the demo, copy both files from the
Stabilo repository and check highlighting, notes, removal, undo, and keyboard
navigation in the demo page. Keep this revision in sync with the copied files.

The files are served directly so the extension code needs no build changes
or extension APIs. Notes remain in memory for the page session.
