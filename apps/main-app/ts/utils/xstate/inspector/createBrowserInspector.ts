import type { StatelyInspectionEvent } from "@statelyai/inspect";
import type { InspectionEvent } from "xstate";

import { NativeModules, Platform } from "react-native";
import { URL } from "react-native-url-polyfill";

import { getDeviceAppVersion } from "../../device";
import { createLazyInspectorTransport } from "./transport";
import { INSPECTOR_PORT, type InspectorRuntime } from "./types";

/** Maximum object depth sent to the development inspector. */
const SERIALIZATION_DEPTH_LIMIT = 10;
const TRUNCATED = "[Truncated]";
const CIRCULAR = "[Circular]";

/** Inspector shape consumed by `createActorContext`. */
export type XStateInspector = {
  inspect: {
    next: (event: InspectionEvent) => void;
  };
};

type ActorLike = {
  getSnapshot: () => unknown;
  id: string;
  logic?: { config?: unknown };
  sessionId: string;
};

/** Returns the URL used to load the current JavaScript bundle from Metro. */
export const metroSourceUrlFromNativeModules = (): unknown =>
  NativeModules?.SourceCode?.getConstants?.()?.scriptURL;

/** Derives the fixed inspector WebSocket from the Metro host. */
export const inspectorEndpointFromSourceUrl = (
  sourceUrl: unknown
): string | undefined => {
  if (typeof sourceUrl !== "string") {
    return undefined;
  }
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return `ws://${url.hostname}:${INSPECTOR_PORT}/xstate-inspector/runtime`;
  } catch {
    return undefined;
  }
};

const boundedClone = (
  value: unknown,
  depth = 0,
  ancestors: Set<object> = new Set()
): unknown => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "function") {
    return { type: value.name };
  }
  if (typeof value !== "object") {
    return value;
  }
  if (depth >= SERIALIZATION_DEPTH_LIMIT) {
    return TRUNCATED;
  }
  if (ancestors.has(value)) {
    return CIRCULAR;
  }
  ancestors.add(value);
  let cloned: unknown;
  if (value instanceof Date) {
    cloned = value.toISOString();
  } else if (value instanceof Error) {
    cloned = { name: value.name, message: value.message };
  } else if (Array.isArray(value)) {
    cloned = value.map(item => boundedClone(item, depth + 1, ancestors));
  } else if (value instanceof Map) {
    cloned = [...value.entries()].map(([key, item]) => [
      boundedClone(key, depth + 1, ancestors),
      boundedClone(item, depth + 1, ancestors)
    ]);
  } else if (value instanceof Set) {
    cloned = [...value].map(item => boundedClone(item, depth + 1, ancestors));
  } else {
    cloned = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        boundedClone(item, depth + 1, ancestors)
      ])
    );
  }
  ancestors.delete(value);
  return cloned;
};

let eventSequence = 0;

/** Converts native XState inspection callbacks to Stately's wire events. */
export const toStatelyInspectionEvent = (
  event: InspectionEvent
): StatelyInspectionEvent | undefined => {
  const createdAt = Date.now().toString();
  const id = `${createdAt}-${eventSequence++}`;
  if (event.type === "@xstate.actor") {
    const actor = event.actorRef as unknown as ActorLike;
    const parent = Reflect.get(actor, "_parent") as ActorLike | undefined;
    const config = actor.logic?.config;
    return {
      type: "@xstate.actor",
      _version: "0.7.2",
      createdAt,
      id,
      rootId: event.rootId,
      sessionId: actor.sessionId,
      parentId: parent?.sessionId,
      name:
        actor.id === actor.sessionId && config !== undefined
          ? String((config as { id?: unknown }).id ?? actor.id)
          : actor.id,
      definition:
        config === undefined ? undefined : JSON.stringify(boundedClone(config)),
      snapshot: boundedClone(actor.getSnapshot()) as never
    };
  }
  if (event.type === "@xstate.event") {
    return {
      type: "@xstate.event",
      _version: "0.7.2",
      createdAt,
      id,
      rootId: event.rootId,
      sessionId: event.actorRef.sessionId,
      sourceId: event.sourceRef?.sessionId,
      event: boundedClone(event.event) as never
    };
  }
  if (event.type === "@xstate.snapshot") {
    return {
      type: "@xstate.snapshot",
      _version: "0.7.2",
      createdAt,
      id,
      rootId: event.rootId,
      sessionId: event.actorRef.sessionId,
      event: boundedClone(event.event) as never,
      snapshot: boundedClone(event.snapshot) as never
    };
  }
  return undefined;
};

const createRuntime = (): InspectorRuntime => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  platform: Platform.OS,
  appVersion: getDeviceAppVersion()
});

let initialized = false;
let inspector: undefined | XStateInspector;

/**
 * Returns one development inspector shared by every root machine provider.
 * Network discovery remains dormant until its first inspection event.
 */
export const createBrowserInspector = (): undefined | XStateInspector => {
  if (initialized) {
    return inspector;
  }
  initialized = true;
  if (!__DEV__ || process.env.NODE_ENV === "test") {
    return undefined;
  }
  const endpoint = inspectorEndpointFromSourceUrl(
    metroSourceUrlFromNativeModules()
  );
  if (endpoint === undefined) {
    return undefined;
  }
  const transport = createLazyInspectorTransport(endpoint, createRuntime());
  inspector = {
    inspect: {
      next: event => {
        try {
          const converted = toStatelyInspectionEvent(event);
          if (converted !== undefined) {
            transport.send(converted);
          }
        } catch {
          // Development inspection must never alter machine behaviour.
        }
      }
    }
  };
  return inspector;
};
