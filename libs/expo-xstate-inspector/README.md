# XState inspector

An Expo dev tools plugin for inspecting XState actors, diagrams, events, context,
and child actors.

## Start the inspector

Run a [development build of the app](../../apps/main-app/README.md#getting-started)
and start Metro from the repository root:

```sh
pnpm nx run main-app:start
```

In Metro, press `Shift+M` and select **Open @io-app/expo-xstate-inspector**.
Open an instrumented flow and select its actor.

Select a diagram state to inspect its configuration. Hermes does not expose inline
guard source by default, so those guards appear as unavailable.

## Inspect a machine

Pass the exported observer to an actor's `inspect` option:

```ts
import { inspect } from "@io-app/expo-xstate-inspector";
import { createActor } from "xstate";

const actor = createActor(machine, { inspect });
actor.start();
```

For an XState React actor context, pass `inspect` in the provider's `options`.
The observer is `undefined` in production.

## Develop the web inspector

The Expo menu serves the built `dist/` page. Rebuild it after changing `web/`:

```sh
pnpm --filter @io-app/expo-xstate-inspector run prepare
```

For hot reload, keep Metro running on port 8081 and start Vite:

```sh
pnpm --filter @io-app/expo-xstate-inspector run dev
```

Inspection data goes through Metro. The browser loads Mermaid from jsDelivr.
