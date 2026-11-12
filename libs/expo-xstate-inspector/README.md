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
uses a smaller, framework-free page focused on the views we need.

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
3. Expo serves the `web/` page. Its `web/src/` client receives the messages
   through the Expo development server, stores actor data in browser memory,
   and renders the views and Mermaid diagram.

When the page connects, it requests the currently running actors. Events sent
while no page is connected are dropped rather than replayed.

## Start the inspector

From the repository root, install dependencies and start Metro:

```sh
pnpm install
pnpm nx run main-app:start
```

The package's `prepare` script compiles `web/src/` into the ignored
`web/scripts/` directory during `pnpm install`. Run `pnpm install` again after
changing the browser source.

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
