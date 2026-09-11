/**
 * Provides one optional XState inspector for development machines.
 *
 * Events are batched and posted to the inspector bridge mounted on Metro's dev
 * server (see `middleware.js` in this package), which relays them to the
 * browser UI over Server-Sent Events. Sharing Metro's port means there is no
 * extra process to launch and no extra port to forward.
 */
import type { StatelyInspectionEvent } from "@statelyai/inspect";
import type { InspectionEvent } from "xstate";

import { NativeModules } from "react-native";
import { URL } from "react-native-url-polyfill";

/** Path owned by the inspector bridge on Metro's dev server. */
const INSPECTOR_PATH = "/xstate-inspector";

/** Events are sent at most this often, so a burst becomes a single request. */
const FLUSH_INTERVAL_MS = 150;

/** A batch is sent as soon as it reaches this size, whatever the timer says. */
const MAX_BATCH_SIZE = 50;

/**
 * Maximum serialization depth for machine context.
 *
 * Deeper values are truncated by `@statelyai/inspect`; 10 is its default and
 * keeps large contexts (eID attestations, credential payloads) off the wire.
 */
const SERIALIZATION_DEPTH_LIMIT = 10;

/** Default ports, used when the bundle URL omits the port. */
const DEFAULT_PORT: Record<string, string> = {
  "http:": "80",
  "https:": "443"
};

/**
 * The inspector surface the app consumes.
 *
 * `@statelyai/inspect` does not export its own inspector type, so the contract
 * is declared here rather than inferred from the factory's return type.
 */
export type XStateInspector = {
  inspect: {
    complete?: () => void;
    error?: (error: unknown) => void;
    next?: (event: InspectionEvent) => void;
  };
};

type InspectorAdapter = {
  send: (event: StatelyInspectionEvent) => void;
  start?: () => void;
  stop?: () => void;
};

/** Returns the URL used to load the current JavaScript bundle from Metro. */
export const metroSourceUrlFromNativeModules = (): unknown =>
  NativeModules?.SourceCode?.getConstants?.()?.scriptURL;

/**
 * Returns the ingest endpoint served by Metro's dev server, derived from the
 * bundle URL so the bridge follows Metro across ports and hosts.
 */
export const inspectorEndpointFromSourceUrl = (
  sourceUrl: unknown
): string | undefined => {
  if (typeof sourceUrl !== "string") {
    return undefined;
  }

  try {
    const url = new URL(sourceUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return undefined;
    }
    const port = url.port !== "" ? url.port : DEFAULT_PORT[url.protocol];
    return `${url.protocol}//${url.hostname}:${port}${INSPECTOR_PATH}/ingest`;
  } catch {
    return undefined;
  }
};

type BatchingAdapterDeps = {
  /** Delivers a batch. Throws are contained. */
  post: (body: string) => void;
  /** Runs `flush` later and returns a canceller. */
  schedule: (flush: () => void) => () => void;
};

/**
 * Batches inspection events into few, larger requests.
 *
 * The adapter is the only place the app talks to the bridge, so a failed or
 * missing bridge can never affect the machines it observes. Buffers are
 * `Map`/`Set` because they are the only mutable collections allowed here.
 */
export const createBatchingAdapter = (
  deps: BatchingAdapterDeps
): InspectorAdapter & { stop: () => void } => {
  const pending = new Map<number, StatelyInspectionEvent>();
  const cancellers = new Set<() => void>();

  const flush = (): void => {
    cancellers.forEach(cancel => cancel());
    cancellers.clear();
    if (pending.size === 0) {
      return;
    }
    const events = [...pending.values()];
    // Cleared before serializing: a batch that cannot be stringified (a circular
    // or BigInt context on an actor event) must not be retried on every flush.
    pending.clear();
    try {
      deps.post(JSON.stringify(events));
    } catch {
      // Development tooling must never break the app it inspects.
    }
  };

  return {
    send: event => {
      pending.set(pending.size, event);
      if (pending.size >= MAX_BATCH_SIZE) {
        flush();
        return;
      }
      if (cancellers.size === 0) {
        cancellers.add(deps.schedule(flush));
      }
    },
    stop: flush
  };
};

/**
 * Creates the shared inspector only for development bundles served by Metro.
 *
 * `@statelyai/inspect` is required lazily so it stays out of the evaluated
 * module graph outside development. Its WebSocket transport is resolved to a
 * stub by `withXStateInspector` in `metro.js`, and the inspector is built on
 * the batched HTTP adapter instead.
 */
const inspector: undefined | XStateInspector = (() => {
  // Jest defines __DEV__ as true too, so test runs need their own exclusion.
  if (!__DEV__ || process.env.NODE_ENV === "test") {
    return undefined;
  }

  const endpoint = inspectorEndpointFromSourceUrl(
    metroSourceUrlFromNativeModules()
  );
  if (endpoint === undefined) {
    return undefined;
  }

  /* eslint-disable @typescript-eslint/no-require-imports */
  const { createInspector: createXStateInspector } =
    require("@statelyai/inspect") as typeof import("@statelyai/inspect");
  /* eslint-enable @typescript-eslint/no-require-imports */

  return createXStateInspector(
    createBatchingAdapter({
      post: body => {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        }).catch(() => undefined);
      },
      schedule: flush => {
        const timeout = setTimeout(flush, FLUSH_INTERVAL_MS);
        return () => clearTimeout(timeout);
      }
    }),
    { serializationDepthLimit: SERIALIZATION_DEPTH_LIMIT }
  );
})();

/**
 * Returns the shared development-only inspector, when one is available.
 *
 * A single instance keeps every machine provider on one batched connection.
 */
export const createBrowserInspector = (): undefined | XStateInspector =>
  inspector;
