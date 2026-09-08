/**
 * Provides one optional XState inspector for development machines.
 *
 * The inspector is initialized once so every provider shares one connection.
 * Inspection events include complete payloads and machine context.
 */
import { NativeModules } from "react-native";
import { URL } from "react-native-url-polyfill";

import { isDevEnv, isTestEnv } from "../environment";

/** The bridge port used by the local Stately Inspector server. */
const INSPECTOR_PORT = 8080;
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
    url: `ws://${host}:${INSPECTOR_PORT}`
  });
})();

/**
 * Returns the shared development-only inspector, when one is available.
 *
 * A single instance keeps all machine providers on one WebSocket connection.
 */
export const createInspector = (): undefined | XStateInspector => inspector;
