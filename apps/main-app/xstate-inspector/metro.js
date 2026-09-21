/**
 * Metro config plugin for the XState inspector.
 *
 * Passed to `mergeConfig` as a function (Metro calls it with the config so
 * far). That is the only Metro-side integration: this module mounts the
 * inspector middleware on the dev server and remaps two `@statelyai/inspect`
 * internals that React Native cannot evaluate. Existing `enhanceMiddleware`
 * and `resolveRequest` hooks are composed, not replaced — a plain config
 * object cannot, because `mergeConfig` shallow-spreads and the last function
 * wins.
 *
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse} ServerResponse
 * @typedef {(req: IncomingMessage, res: ServerResponse, next: () => void) => void} Middleware
 * @typedef {{ type: "empty" } | { type: "sourceFile", filePath: string }} Resolution
 * @typedef {{
 *   resolveRequest: (
 *     context: ResolveContext,
 *     moduleName: string,
 *     platform: string | null
 *   ) => Resolution
 * }} ResolveContext
 * @typedef {(
 *   context: ResolveContext,
 *   moduleName: string,
 *   platform: string | null
 * ) => Resolution} ResolveRequest
 * @typedef {(middleware: Middleware, server?: unknown) => Middleware} EnhanceMiddleware
 * @typedef {{
 *   server?: { enhanceMiddleware?: EnhanceMiddleware }
 *   resolver?: { resolveRequest?: ResolveRequest }
 * }} MetroConfig
 */
const path = require("path");

/**
 * Browser UUID implementation shipped next to `@statelyai/inspect`'s entry.
 *
 * `require.resolve("@statelyai/inspect")` lands on `dist/index.mjs`, so the
 * sibling `uuid-browser.mjs` is the `browser`/`worker` branch of the
 * package's `#uuid` import. Metro does not honour that `imports` map, and
 * the `default` branch is `node:crypto`, which Metro cannot resolve.
 *
 * `undefined` when the package is missing: `#uuid` then falls through to
 * whatever resolver was already configured.
 *
 * @type {string | undefined}
 */
const uuidBrowserPath = (() => {
  try {
    return path.join(
      path.dirname(require.resolve("@statelyai/inspect")),
      "uuid-browser.mjs"
    );
  } catch {
    return undefined;
  }
})();

/**
 * @param {string} moduleName
 * @returns {Resolution | undefined}
 */
const resolveInspectModule = moduleName => {
  // `@statelyai/inspect`'s entry also imports partysocket, whose module
  // scope needs a global `Event` that React Native does not provide, so
  // evaluating it crashes the dev app. Only `createInspector` is used here —
  // the bridge drives it over HTTP and Server-Sent Events — so its WebSocket
  // transport is resolved to an empty module. Using that transport would
  // fail with a missing `PartySocket` rather than silently misbehaving.
  if (moduleName === "partysocket") {
    return { type: "empty" };
  }
  if (moduleName === "#uuid" && uuidBrowserPath !== undefined) {
    return { type: "sourceFile", filePath: uuidBrowserPath };
  }
  return undefined;
};

/**
 * Wraps a Metro config so the inspector is served from the same port as the
 * bundler, and so `@statelyai/inspect` can be required from React Native.
 *
 * A failure inside the inspector never replaces the incoming config: Metro
 * keeps running and the inspector routes 404 instead of taking the dev
 * server down.
 *
 * @param {MetroConfig} metroConfig
 * @returns {MetroConfig}
 */
const withXStateInspector = metroConfig => {
  try {
    const previousEnhance = metroConfig.server?.enhanceMiddleware;
    const previousResolve = metroConfig.resolver?.resolveRequest;

    /** @type {EnhanceMiddleware} */
    const enhanceMiddleware = (metroMiddleware, metroServer) => {
      const next =
        previousEnhance !== undefined
          ? previousEnhance(metroMiddleware, metroServer)
          : metroMiddleware;
      try {
        const { createXStateInspectorMiddleware } = require("./middleware");
        const inspectorMiddleware = createXStateInspectorMiddleware();
        /** @type {Middleware} */
        const wrapped = (req, res, nxt) =>
          inspectorMiddleware(req, res, () => next(req, res, nxt));
        return wrapped;
      } catch {
        return next;
      }
    };

    /** @type {ResolveRequest} */
    const resolveRequest = (context, moduleName, platform) => {
      const redirected = resolveInspectModule(moduleName);
      if (redirected !== undefined) {
        return redirected;
      }
      if (previousResolve !== undefined) {
        return previousResolve(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    };

    return {
      ...metroConfig,
      server: {
        ...metroConfig.server,
        enhanceMiddleware
      },
      resolver: {
        ...metroConfig.resolver,
        resolveRequest
      }
    };
  } catch {
    return metroConfig;
  }
};

module.exports = { withXStateInspector };
