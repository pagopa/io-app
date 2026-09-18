# @io-app/xstate-inspector

A development-only inspector for the XState machines in the [IO app](../../apps/main-app/README.md). The app reports machine events to Metro, and a browser page shows them as a timeline per machine. Nothing runs in production. Metro serves the UI and relays the events on the port it already uses, and `pnpm nx run xstate-inspector:start` keeps the bundle it serves up to date.

## How machine events reach the browser

The React Native bridge receives every inspection event XState emits and batches them. It posts a batch to `<metro-host>/xstate-inspector/ingest` every 150 ms, or sooner when the batch reaches 50 events. Metro’s dev server mounts `middleware.js` on that path, and the middleware fans every event out to the connected pages over Server-Sent Events (SSE).

The UI keys a tab by the machine id in the actor registration event. A machine that the app disposes and sets up again replaces its own timeline instead of opening a second tab. The UI renders the three XState event types, `@xstate.actor`, `@xstate.event`, and `@xstate.snapshot`, and shows any other event as-is. `browser/src/types.d.ts` declares the wire format.

## What this package contains

The package has two entry points and one static UI:

```text
libs/xstate-inspector/
├── src/
│   ├── index.ts                    exports createBrowserInspector
│   ├── createBrowserInspector.ts   endpoint, batching, build guards
│   └── __tests__/                  unit tests for the bridge
├── middleware.js                   Connect middleware that Metro mounts
├── metro.js                        Metro config plugin: middleware + RN shims
├── browser/                        inspector UI
│   ├── build.mjs                   bundles src/ into dist/ with esbuild
│   ├── index.html                  markup and styles, copied into dist/
│   ├── src/                        UI sources, one module per concern
│   │   ├── app.js                  entry point: toolbar, export, SSE stream
│   │   ├── store.js                zustand store: machine tabs and their caps
│   │   ├── view.js                 tab strip and timeline rendering
│   │   ├── wire.js                 wire event to timeline entry
│   │   ├── format.js               payload to text helpers
│   │   ├── constants.js            retention and rendering tunables
│   │   └── types.d.ts              wire format declarations
│   └── dist/                       built bundle the middleware serves, not committed
├── package.json
├── tsconfig.json
├── jest.config.js
└── babel.config.js
```

`@io-app/xstate-inspector` resolves to `src/index.ts` for the app bundle. `@io-app/xstate-inspector/middleware` resolves to `middleware.js` for Node. `@io-app/xstate-inspector/metro` resolves to `metro.js`, the only Metro config the app has to apply. Neither bundle includes the browser UI, because the middleware reads it from disk.

`browser/src` holds one module per concern: the zustand store keeps the machine tabs and their retention caps, `view.js` renders the tabs and the timeline and repaints when the store changes, `wire.js` normalizes the wire events, and `app.js` wires the toolbar and the stream together. `browser/build.mjs` bundles them into `browser/dist`, the directory the middleware serves, so the page loads a single file while the sources stay separate. `dist` is generated, not committed.

## Report a machine to the inspector

Import the bridge and pass the inspector to the machine context. The pattern matches the machine providers in the app, for example `apps/main-app/ts/features/itwallet/machine/eid/provider.tsx`:

```typescript
import { createActorContext } from "@xstate/react";
import { createBrowserInspector } from "@io-app/xstate-inspector";

const inspector = createBrowserInspector();

export const MachineContext = createActorContext(
  myMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);
```

`createBrowserInspector` returns one shared inspector for the whole app, or `undefined` when inspection must not run. `myMachine` is the machine the provider wraps.

The bridge returns `undefined` in three cases, and the provider stays valid in all of them:

- The build is not a development build, which is what `__DEV__` reports.
- `NODE_ENV` is `test`, which is what a Jest run sets.
- The bundle did not load over HTTP or HTTPS, which happens in a release build with an embedded bundle.

Inspector failures never reach the app. The bridge drops a failed POST, a serialization error, or a circular context, and the observed machines keep running.

## Open the inspector while the app runs

Run Metro, start a development build that loads its bundle from Metro, then open <http://localhost:8081/xstate-inspector/>. The [main app README](../../apps/main-app/README.md#xstate-inspector) lists the device commands. Both sides go through Metro, so the inspector keeps working when Metro moves to another host or port.

Open the page before you reproduce a flow. The relay buffers nothing, so it drops events sent while no page is connected, and a reload starts from an empty timeline.

## Bridge routes

The middleware answers only under `/xstate-inspector` and passes every other path to Metro:

| Route | Method | Purpose |
| --- | --- | --- |
| `/xstate-inspector/` | GET | Serves the UI and its assets from `browser/` |
| `/xstate-inspector/stream` | GET | Opens the SSE stream, one per open page |
| `/xstate-inspector/ingest` | POST | Accepts a JSON batch from the app and answers `204` |
| `/xstate-inspector/health` | GET | Reports the `clients`, `received`, and `rejected` counts |

`middleware.js` exports `createXStateInspectorMiddleware` and `PREFIX`. `metro.js` exports `withXStateInspector`, which mounts that middleware and remaps the two `@statelyai/inspect` internals React Native cannot evaluate.

## Browser UI features

The UI is one page, and every control works on the machine of the selected tab:

- **Machine tabs**: one per machine id, in the order the app registered them.
- **Status**: `connected` while the stream is open, `reconnecting` while a retry is pending.
- **Filter**: matches the event type, the state value, or the payload text.
- **Timeline**: actor registration, transitions, incoming events, errors, and actor output, with each payload expandable.
- **Export JSON**: downloads the retained events of the selected machine.
- **Clear**: empties the timeline without touching the app.

## Metro configuration the app must keep

The app passes `withXStateInspector` to `mergeConfig`. That is the only Metro-side integration:

```javascript
const { withXStateInspector } = require("@io-app/xstate-inspector/metro");

module.exports = mergeConfig(defaultConfig, config, withXStateInspector);
```

`mergeConfig` calls a function argument with the config so far, so the wrapper can compose with whatever `enhanceMiddleware` and `resolveRequest` the app already has. A plain inspector config object cannot: `mergeConfig` shallow-spreads `resolver` / `server`, and the last function wins, which would drop the app's `crypto` remap. Other Metro customisation (SVG, `crypto`, asset roots) stays in the app config. A failure inside the inspector never replaces that config: Metro keeps running and the inspector routes 404 instead of taking the dev server down. Check `/xstate-inspector/health` first when the page does not connect.

Inside the wrapper, two resolver entries exist because the bridge depends on `@statelyai/inspect`, whose entry point imports a WebSocket client at module scope. `partysocket` extends `EventTarget` in its module scope, which React Native does not define, so evaluating it crashes the app; it is resolved to an empty module. The `#uuid` import resolves to `node:crypto` by default, which Metro cannot resolve, so it is pointed at the browser build that ships with `@statelyai/inspect`. The app never imports that library itself and does not declare it.

## Limits and retention

The inspector bounds what it keeps, so a long session on a large context cannot exhaust the app, the dev server, or the browser tab:

- Batch: 50 events or 150 ms, whichever comes first.
- Request body: 16 MB. The middleware rejects a larger batch with `413`.
- Serialization depth: 10 levels of machine context, so a large context never reaches the wire in full.
- Per machine: 20000 events or 32 MB, whichever comes first. The UI evicts the oldest events and counts them above the timeline.
- Rendered rows: the last 400 after filtering, with the rest counted.
- Slow page: the middleware disconnects a client that has 4 MB queued instead of buffering for it.
- Idle stream: a comment frame every 15s keeps the connection open through proxies and device tunnels.

## Development commands

```bash
pnpm nx run xstate-inspector:start        # builds browser/src into browser/dist, rebuilding on change
pnpm nx run xstate-inspector:build        # the same build, once
pnpm nx run xstate-inspector:test
pnpm nx run xstate-inspector:tsc-noemit
pnpm nx run xstate-inspector:lint
```

Run `start` in its own terminal, next to `pnpm nx run main-app:start`. The middleware serves the bundle in `browser/dist`, not the sources, so Metro never picks up an edit by itself: reloading the page is not enough. Use `build` when the UI only has to exist once, for example in a checkout that is not being worked on.

`tsc-noemit` also checks `middleware.js`, `browser/build.mjs` and the modules under `browser/src`, because the package tsconfig sets `checkJs`. `pnpm nx affected --targets=lint,tsc-noemit,test` runs the same targets for every project that changed.

## Troubleshooting

**The page reports `reconnecting`.** Nothing answers the SSE route. Confirm Metro is running, then open `http://localhost:8081/xstate-inspector/health`. A 404 means the middleware did not mount: `withXStateInspector` is missing from `metro.config.js`, or it caught a failure and left Metro running without the inspector.

**The UI 404s, or shows a change you already made.** `browser/dist` is missing or stale. Run `pnpm nx run xstate-inspector:start` while you work on the UI, or `pnpm nx run xstate-inspector:build` for a one-off build.

**Metro answers `Unauthorized request from http://127.0.0.1:8081`.** Open the page through `localhost` instead. Module scripts send an `Origin` header, and Metro’s dev server rejects every Origin that is not localhost.

**The page reports `connected` but no tab appears.** The app is not reporting. Check that the build loads its bundle from Metro, and that the machine provider calls `createBrowserInspector` before it creates the actor context.

**A tab exists and its timeline starts mid-flow.** The page was opened after those events were sent. The relay keeps no history, so open the page first and reload it to start over.
