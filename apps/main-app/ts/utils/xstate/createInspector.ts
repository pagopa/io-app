/**
 * Provides one optional XState inspector for development machines.
 *
 * The inspector is initialized once so every provider shares one connection.
 * Serialized events keep state metadata but redact event payloads and context
 * before they leave the app.
 */
import type {
  StatelyActorEvent,
  StatelyInspectionEvent
} from "@statelyai/inspect";

import { NativeModules } from "react-native";
import { URL } from "react-native-url-polyfill";

import { isDevEnv, isTestEnv } from "../environment";

/** The bridge port used by the local Stately Inspector server. */
const INSPECTOR_PORT = 8080;
type InspectionSnapshot = StatelyActorEvent["snapshot"];
type RedactedSnapshot = Pick<InspectionSnapshot, "status" | "value"> & {
  context: Record<string, never>;
};
type XStateInspector = ReturnType<
  typeof import("@statelyai/inspect").createWebSocketInspector
>;

/**
 * Returns the Metro hostname when the bundle URL uses HTTP(S).
 *
 * Native modules expose this value as untyped data, so invalid or unsupported
 * schemes are rejected at this boundary.
 */
export const metroHostFromSourceUrl = (
  sourceUrl: unknown
): string | undefined => {
  if (typeof sourceUrl !== "string") {
    return undefined;
  }

  try {
    const url = new URL(sourceUrl);
    return ["http:", "https:"].includes(url.protocol)
      ? url.hostname
      : undefined;
  } catch {
    return undefined;
  }
};

/** Returns the URL used to load the current JavaScript bundle from Metro. */
export const metroSourceUrlFromNativeModules = (): unknown =>
  NativeModules?.SourceCode?.getConstants?.()?.scriptURL;

/** Keeps state metadata while removing sensitive machine context. */
const redactSnapshot = (snapshot: InspectionSnapshot): RedactedSnapshot => ({
  status: snapshot.status,
  value: snapshot.value,
  context: {}
});

/**
 * Removes event payloads and machine context before they cross the inspector
 * boundary. State values remain available for debugging without exposing data.
 * The upstream snapshot type requires output and error fields, so the redacted
 * snapshot is asserted at this serialization boundary after omitting them.
 */
export const serializeInspectionEvent = (
  event: StatelyInspectionEvent
): StatelyInspectionEvent => {
  switch (event.type) {
    case "@xstate.actor":
      return { ...event, snapshot: redactSnapshot(event.snapshot) };
    case "@xstate.event":
      return { ...event, event: { type: event.event.type } };
    case "@xstate.snapshot":
      return {
        ...event,
        event: { type: event.event.type },
        snapshot: redactSnapshot(event.snapshot)
      } as unknown as StatelyInspectionEvent;
    default: {
      const exhaustiveEvent: never = event;
      return exhaustiveEvent;
    }
  }
};

/**
 * Creates the shared inspector only for development bundles served by Metro.
 *
 * PartySocket is loaded dynamically because its browser globals are not
 * available in every React Native runtime.
 */
const inspector: undefined | XStateInspector = (() => {
  if (!isDevEnv || isTestEnv) {
    return undefined;
  }

  const host = metroHostFromSourceUrl(metroSourceUrlFromNativeModules());
  if (!host) {
    return undefined;
  }

  type PartySocketGlobals = {
    Event: typeof globalThis.Event;
    EventTarget: typeof globalThis.EventTarget;
  };

  /* eslint-disable @typescript-eslint/no-require-imports */
  const { Event: PartySocketEvent, EventTarget: PartySocketEventTarget } =
    require("event-target-shim") as PartySocketGlobals;
  /* eslint-enable @typescript-eslint/no-require-imports */

  /* eslint-disable functional/immutable-data */
  if (typeof globalThis.Event !== "function") {
    Object.defineProperty(globalThis, "Event", {
      configurable: true,
      value: PartySocketEvent,
      writable: true
    });
  }
  if (typeof globalThis.EventTarget !== "function") {
    Object.defineProperty(globalThis, "EventTarget", {
      configurable: true,
      value: PartySocketEventTarget,
      writable: true
    });
  }
  /* eslint-enable functional/immutable-data */

  /* eslint-disable @typescript-eslint/no-require-imports */
  const { createWebSocketInspector } =
    require("@statelyai/inspect") as typeof import("@statelyai/inspect");
  /* eslint-enable @typescript-eslint/no-require-imports */
  return createWebSocketInspector({
    url: `ws://${host}:${INSPECTOR_PORT}`,
    serialize: serializeInspectionEvent
  });
})();

/**
 * Returns the shared development-only inspector, when one is available.
 *
 * A single instance keeps all machine providers on one WebSocket connection.
 */
export const createInspector = (): undefined | XStateInspector => inspector;
