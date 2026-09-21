# @io-app/xstate-inspector

A development-only inspector for the XState machines in the [IO app](../../apps/main-app/README.md). The app reports machine events to Metro, and a browser page shows them as a timeline per machine. Nothing runs in production.

## Run the inspector

You need Metro and a development build that loads its bundle from Metro. The [main app README](../../apps/main-app/README.md#xstate-inspector) lists the device commands for iOS and Android.

1. Start the UI build in its own terminal. It rebuilds as you edit the UI sources.

   ```bash
   pnpm nx run xstate-inspector:start
   ```

2. Start Metro, then build and launch the app from a second terminal.

   ```bash
   pnpm nx run main-app:start
   pnpm nx run main-app:run-ios
   ```

3. Open [the inspector page](http://localhost:8081/xstate-inspector/).

Open the page before you reproduce a flow. The relay keeps no history, so it drops events sent while no page is connected, and a reload starts from an empty timeline.

Both the app and the page go through Metro, so the inspector keeps working when Metro moves to another host or port.

## Use the inspector page

Every control applies to the machine in the selected tab:

- **Machine tabs**: one per machine id, in the order the app registered them. A machine the app disposes and sets up again replaces its own tab instead of opening a second one.
- **Status**: `connected` while the stream is open, `reconnecting` while a retry is pending.
- **Filter**: matches the event type, the state value, or the payload text.
- **Timeline**: actor registration, transitions, incoming events, errors, and actor output. Select a row to expand its payload.
- **Export JSON**: downloads the retained events of the selected machine.
- **Clear**: empties the timeline without touching the app.

## Report a machine to the inspector

Import the bridge and pass it to the machine context. The providers in the app follow this pattern, for example [the IT Wallet eID provider](../../apps/main-app/ts/features/itwallet/machine/eid/provider.tsx):

```typescript
import { createActorContext } from "@xstate/react";
import { createBrowserInspector } from "@io-app/xstate-inspector";

const inspector = createBrowserInspector();

export const MachineContext = createActorContext(
  myMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);
```

`createBrowserInspector` returns one shared inspector for the whole app, or `undefined` when inspection must not run. The provider stays valid either way, because the bridge returns `undefined` in three cases:

- The build is not a development build, which is what `__DEV__` reports.
- `NODE_ENV` is `test`, which is what a Jest run sets.
- The bundle did not load over HTTP or HTTPS, which happens in a release build with an embedded bundle.

Inspector failures never reach the app. The bridge drops a failed POST, a serialization error, or a circular context, and the observed machines keep running.

## Troubleshoot the page

Every failure looks like one of three things: a status line that never reaches `connected`, a page that will not load, or a timeline that stays empty.

**The status says `reconnecting`.** Nothing answers the stream route. Confirm Metro is running, then open `http://localhost:8081/xstate-inspector/health`. A `404` means the middleware did not mount, which happens when `withXStateInspector` is missing from `metro.config.js`.

**The page returns `404`, or shows a change you made earlier.** `browser/dist` is missing or stale. Run `pnpm nx run xstate-inspector:start` while you work on the UI, or `pnpm nx run xstate-inspector:build` for a one-off build.

**Metro answers `Unauthorized request from http://127.0.0.1:8081`.** Open the page through `localhost` instead. Module scripts send an `Origin` header, and the Metro dev server rejects every Origin that is not localhost.

**The status says `connected` and no tab appears.** The app is not reporting. Check that the build loads its bundle from Metro, and that the machine provider calls `createBrowserInspector` before it creates the actor context.

**A tab starts mid-flow.** You opened the page after those events were sent. The relay keeps no history, so open the page first and reload it to start over.

## Development commands

| Command | What it does |
| --- | --- |
| `pnpm nx run xstate-inspector:start` | Builds `browser/src` into `browser/dist`, and rebuilds on change |
| `pnpm nx run xstate-inspector:build` | Builds the UI once |
| `pnpm nx run xstate-inspector:test` | Runs the Jest suites |
| `pnpm nx run xstate-inspector:tsc-noemit` | Type-checks the bridge, the middleware and the UI |
| `pnpm nx run xstate-inspector:lint` | Lints the TypeScript |

Run the UI build next to `pnpm nx run main-app:start`. The middleware serves `browser/dist`, not the sources, so Metro never picks up a UI edit on its own. Reloading the page is not enough.

## What the inspector keeps

The inspector caps what it keeps, so a long session on a large context cannot exhaust the app, the dev server, or the browser tab:

- Batch: 50 events or 150 ms, whichever comes first.
- Request body: 16 MB. The middleware rejects a larger batch with `413`.
- Serialization depth: 10 levels of machine context.
- Per machine: 20000 events or 32 MB, whichever comes first. The page evicts the oldest events and counts them above the timeline.
- Rendered rows: the last 400 after filtering, with the rest counted.
- Slow page: the middleware disconnects a client with 4 MB queued instead of buffering for it.
- Idle stream: a comment frame every 15s keeps the connection open through proxies and device tunnels.

## How the pieces connect

The bridge batches inspection events and posts them to the dev server. The middleware fans each batch out to the open pages over Server-Sent Events (SSE). The React page renders one timeline per machine.

`@io-app/xstate-inspector` resolves to `src/index.ts`, the bridge the app imports. `@io-app/xstate-inspector/middleware` resolves to `middleware.js`, which Metro mounts. `@io-app/xstate-inspector/metro` resolves to `metro.js`, the Metro wrapper the app applies. Neither bundle includes the page, because the middleware reads it from disk.

The app’s `metro.config.js` already applies `withXStateInspector`. Pass it to `mergeConfig` as a function argument, otherwise the last `resolver` or `server` function wins and the app loses its own Metro customisation:

```javascript
const { withXStateInspector } = require("@io-app/xstate-inspector/metro");

module.exports = mergeConfig(defaultConfig, config, withXStateInspector);
```

Every route sits under `/xstate-inspector`, and the middleware passes every other path to Metro:

| Route | Method | Purpose |
| --- | --- | --- |
| `/xstate-inspector/` | GET | Serves the page and its assets |
| `/xstate-inspector/stream` | GET | Opens the stream, one per open page |
| `/xstate-inspector/ingest` | POST | Accepts a JSON batch from the app and answers `204` |
| `/xstate-inspector/health` | GET | Reports the `clients`, `received` and `rejected` counts |

Look at `browser/src` for the page itself. It groups by purpose: `lib/` holds pure modules, `state/` holds the timeline store and the hooks around it, and `ui/` holds the components.
