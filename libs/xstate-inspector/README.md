# @io-app/xstate-inspector

Standalone development inspector for XState machines running in `main-app`.
The project owns its Vite server, WebSocket relay, replay buffer, and browser UI.
Metro remains independent.

## Run

Start the inspector. Vite opens the browser at `http://localhost:5173`.

```bash
pnpm nx run xstate-inspector:start
```

Start Metro and a development build separately.

```bash
pnpm nx run main-app:start
pnpm nx run main-app:run-ios
```

The React Native client derives the computer address from Metro's bundle URL.
It opens the inspector WebSocket only when XState emits its first inspection
event. This works with iOS Simulator, Android Emulator, and physical devices
that can reach the Metro computer on port `5173`.

> The inspector sends raw machine events and contexts without redaction or
> authentication. Use it only on a trusted local network. Browser UI routes are
> restricted to the computer running the inspector.

## Use

- One tab represents one root machine ID. A new actor with the same machine ID
  clears and replaces that tab.
- The actor tree shows the selected root and its spawned children.
- The timeline shows registrations, events, snapshots, transitions, failures,
  context, output, and timestamps.
- Filter searches event type, state, and payload text.
- Export downloads retained raw events as JSON.
- Clear removes the browser timeline without affecting the app.

The inspector retains at most `10,000` events or `16 MB`, oldest first. Its
in-memory replay survives browser reloads and disappears when the inspector
process stops. A new app runtime clears the previous runtime immediately.

## Add a machine

Root providers explicitly attach the shared development inspector:

```typescript
import { createActorContext } from "@xstate/react";

import { createBrowserInspector } from "../../../utils/xstate/inspector";

const inspector = createBrowserInspector();

export const MachineContext = createActorContext(
  machine,
  inspector ? { inspect: inspector.inspect } : undefined
);
```

`createBrowserInspector()` returns `undefined` for production builds, Jest, or
bundles without an HTTP Metro source URL. All provider calls share one lazy
WebSocket and one runtime identity. Child actors inherit root inspection.

## Ownership

- `server/`: Vite WebSocket adapter and bounded runtime session.
- `src/state/`: browser connection and derived timeline state.
- `src/ui/`: tabs, actor tree, toolbar, and timeline.
- `src/lib/`: defensive event normalization, formatting, and export.
- `apps/main-app/ts/utils/xstate/inspector/`: development-only React Native
  client.

The client and server exchange raw `@statelyai/inspect` event shapes inside a
small versioned envelope. Protocol mismatches fail visibly instead of being
parsed best-effort.

## Checks

```bash
pnpm nx run xstate-inspector:test
pnpm nx run xstate-inspector:tsc-noemit
pnpm nx run xstate-inspector:lint
pnpm nx run xstate-inspector:build
```
