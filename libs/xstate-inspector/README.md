# @io-app/xstate-inspector

The browser page that shows the XState machines of the [IO app](../../apps/main-app/README.md) as a timeline, one tab per machine. It is a Vite and React app, served by Metro's dev server under `/xstate-inspector/`. Nothing runs in production.

The rest of the tool lives in the app: the React Native bridge is [ts/utils/xstate/inspector.ts](../../apps/main-app/ts/utils/xstate/inspector.ts) and the dev-server relay is [xstate-inspector/](../../apps/main-app/xstate-inspector).

## Run the inspector

You need Metro and a development build that loads its bundle from Metro.

1. Start the page build in its own terminal. It rebuilds as you edit the sources.

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

The bridge is app code, so a provider imports it by relative path, for example [the IT Wallet eID provider](../../apps/main-app/ts/features/itwallet/machine/eid/provider.tsx):

```typescript
import { createActorContext } from "@xstate/react";
import { createBrowserInspector } from "../../../utils/xstate/inspector";

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

**The status says `reconnecting`.** Nothing answers the stream route. Confirm Metro is running, then open `http://localhost:8081/xstate-inspector/health`. A `404` means the middleware did not mount, which happens when `withXStateInspector` is missing from [metro.config.js](../../apps/main-app/metro.config.js).

**The page returns `404`, or shows a change you made earlier.** `libs/xstate-inspector/dist` is missing or stale. Run `pnpm nx run xstate-inspector:start` while you work on the UI, or `pnpm nx run xstate-inspector:build` for a one-off build. The middleware serves that directory, so Metro never picks up an unbuilt UI edit on its own.

**Metro answers `Unauthorized request from http://127.0.0.1:8081`.** Open the page through `localhost` instead. Module scripts send an `Origin` header, and the Metro dev server rejects every Origin that is not localhost.

**The status says `connected` and no tab appears.** The app is not reporting. Check that the build loads its bundle from Metro, and that the machine provider calls `createBrowserInspector` before it creates the actor context.

**A tab starts mid-flow.** You opened the page after those events were sent. The relay keeps no history, so open the page first and reload it to start over.

## Development commands

| Command | What it does |
| --- | --- |
| `pnpm nx run xstate-inspector:start` | Builds `src` into `dist`, and rebuilds on change |
| `pnpm nx run xstate-inspector:build` | Builds the page once |
| `pnpm nx run xstate-inspector:test` | Runs the Vitest suites |
| `pnpm nx run xstate-inspector:tsc-noemit` | Type-checks the page |
| `pnpm nx run xstate-inspector:lint` | Lints the TypeScript |

Run the page build next to `pnpm nx run main-app:start`, then reload the page to see the new bundle.

## What the page keeps

The page caps what it holds, so a long session on a large context cannot exhaust the browser tab:

- Per machine: 20000 events or 32 MB, whichever comes first. The page evicts the oldest events and counts them above the timeline.
- Rendered rows: the last 400 after filtering, with the rest counted.

The app side caps the batches it sends and the relay caps the bodies it accepts; both live in `apps/main-app/xstate-inspector`.

## How the pieces connect

The bridge in the app batches inspection events and posts them to the dev server. The middleware in the app fans each batch out to the open pages over Server-Sent Events (SSE). This app renders one timeline per machine, and the middleware serves it from `dist`.

Every route sits under `/xstate-inspector`, and the middleware passes every other path to Metro:

| Route | Method | Purpose |
| --- | --- | --- |
| `/xstate-inspector/` | GET | Serves the page and its assets |
| `/xstate-inspector/stream` | GET | Opens the stream, one per open page |
| `/xstate-inspector/ingest` | POST | Accepts a JSON batch from the app and answers `204` |
| `/xstate-inspector/health` | GET | Reports the `clients`, `received` and `rejected` counts |

`vite.config.ts` sets `base` to `/xstate-inspector/`, so the built asset URLs match those routes.

Look at `src` for the page itself. It groups by purpose: `lib/` holds pure modules, `state/` holds the timeline store and the hooks around it, and `ui/` holds the components.
