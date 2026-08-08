# TODO: remove this section if merging to master
Update /c URL: sabililhaq.com/chat
Purpose: Simple, anonymous, temporary chat for personal/peer use.
No accounts / login
Random nickname: adjective + animal, e.g. sleepy-panda, blue-frog, curious-otter
Single shared chat: no rooms or room URLs.
Real-time communication: WebSocket.
Message expiration: messages disappear after X minutes, with X fetched from backend configuration.
In-memory / ephemeral: no need for permanent message history.
Backend: separate WebSocket service at ws.sabililhaq.com; this is an implementation detail and isn't exposed to normal users.
Swearing filter: The backend automatically filters configured swear/banned words before broadcasting messages. Filtering is implemented using the Aho–Corasick string-matching algorithm for efficient multi-pattern matching.
Info dropdown: an ⓘ button explaining:
For fun only — this is a small personal project, not intended for important/private communication.
Temporary chat — messages disappear after X minutes. The displayed value should come from the backend configuration rather than being hardcoded in the frontend.
Built with WebSockets — the chat is a small demonstration of real-time WebSocket communication.
For developers — open your browser's Developer Tools → Network → WS to inspect the WebSocket connection and see messages being sent and received in real time.

I'd word the developer section particularly simply:

Curious how it works? Open your browser's Network inspector, filter for WS, and watch the WebSocket connection. You can see messages travel between your browser and the server in real time.

That gives the project a nice dual purpose: useful enough to actually chat, but also explicitly a small WebSocket demonstration.chat spec
Public URL: sabililhaq.com/chat
Purpose: Simple, anonymous, temporary chat for personal/peer use.
No accounts / login
Random nickname: adjective + animal, e.g. sleepy-panda, blue-frog, curious-otter
Single shared chat: no rooms or room URLs.
Real-time communication: WebSocket.
Message expiration: messages disappear after X minutes, with X fetched from backend configuration.
In-memory / ephemeral: no need for permanent message history.
Backend: separate WebSocket service at ws.sabililhaq.com; this is an implementation detail and isn't exposed to normal users.
Info dropdown: an ⓘ button explaining:
For fun only — this is a small personal project, not intended for important/private communication.
Swearing filter — messages are automatically checked for configured swear words before being delivered.
Temporary chat — messages disappear after X minutes. The displayed value should come from the backend configuration rather than being hardcoded in the frontend.
Built with WebSockets — the chat is a small demonstration of real-time WebSocket communication.
For developers — open your browser's Developer Tools → Network → WS to inspect the WebSocket connection and see messages being sent and received in real time.

I'd word the developer section particularly simply:

Curious how it works? Open your browser's Network inspector, filter for WS, and watch the WebSocket connection. You can see messages travel between your browser and the server in real time.

That gives the project a nice dual purpose: useful enough to actually chat, but also explicitly a small WebSocket demonstration.

# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and Open Graph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
