# XState inspector

This Expo dev tools plugin shows the state of XState actors running in the app.
It displays machine diagrams, active and visited states, taken transitions,
context, events, and child actors.

Click a state to open a box listing its configured entry, exit, initial, and
transition actions, its invoked actors (with their IDs when provided), and its
transitions. These are definitions, not an execution trace; anonymous actions
and inline actors are labelled as such. Click elsewhere or press × to close it.

## Why

[Stately's browser inspector](https://github.com/statelyai/inspect/blob/d72a7fce0927380e0538383ce2dbf2df22fce2e9/src/browser.ts)
opens a Stately-hosted page and sends inspection events to that page by default.
The full interface can be resource-intensive for everyday debugging. This plugin
uses a smaller React app focused on the views we need.

The plugin sends inspection messages through the configured Expo development
server, not to Stately. Use a local server on a trusted network if the inspection
data must stay local. The browser still downloads and runs Mermaid from jsDelivr,
so the page contacts a third party and is not fully offline.

## Architecture

1. `src/index.ts` exports an XState `inspect` observer in development. It is
   `undefined` in production.
2. `src/handlers/`, `src/serializers/`, and `src/registries/` prepare actor
   definitions, events, microsteps, and snapshots. The registry tracks running
   actors. `src/transports/` sends the messages through Expo dev tools.
3. Vite bundles the React app in `web/` into `dist/`, which Expo serves. Its `web/src/` client receives the messages
   through the Expo development server, stores actor data in browser memory,
   and renders React components and the Mermaid diagram.

The web app keeps composition and the Expo connection in `web/src/app/`,
actor inspection and diagram features in `web/src/features/`, and shared
inspection models and UI in `web/src/shared/`. Tests and feature-specific
styles live alongside their modules.

When the page connects, it requests the currently running actors. Events sent
while no page is connected are dropped rather than replayed.

## Start the inspector

From the repository root, install dependencies and start Metro:

```sh
pnpm install
pnpm nx run main-app:start
```

The package's `prepare` script runs Vite during `pnpm install`, bundling
React, TypeScript, Tailwind CSS, and the app's Titillio fonts into the ignored `dist/`
directory. After changing browser source or styles, rebuild with:

```sh
pnpm --filter @io-app/expo-xstate-inspector run prepare
```

The React web UI mirrors the IO design system's semantic light/dark
colors; it does not load React Native components. Tailwind and fonts are served
locally, with no additional runtime CDN requests.

For web development with hot reload, keep Metro running on port 8081 and run:

```sh
pnpm --filter @io-app/expo-xstate-inspector run dev
```

Open the URL printed by Vite. Its development server proxies the inspection
WebSocket to Metro. The Expo plugin menu continues to serve the built `dist/`
page, so rebuild before testing through that menu.

1. Run a development build of the app on a device or emulator. See the
   [main app setup](../../apps/main-app/README.md#getting-started) for platform
   instructions.
2. In the Metro terminal, press `Shift+M` and select **Open
   @io-app/expo-xstate-inspector**.
3. Open a flow with an instrumented machine and select the machine in the
   inspector. The app already instruments several IDPay and IT Wallet machines.

## Inspect a machine

Pass the exported observer to an actor's `inspect` option:

```ts
import { inspect } from "@io-app/expo-xstate-inspector";
import { createActor } from "xstate";

const actor = createActor(machine, { inspect });
actor.start();
```

For an XState React actor context, pass `inspect` in the provider's `options`
instead.
