import type { StatelyInspectionEvent } from "@statelyai/inspect";

import { NativeModules } from "react-native";

import {
  createInspector,
  metroHostFromSourceUrl,
  metroSourceUrlFromNativeModules,
  serializeInspectionEvent
} from "../createInspector";

describe("createInspector helpers", () => {
  it("does not create an inspector in test environments", () => {
    expect(createInspector()).toBeUndefined();
  });
  it("reads Metro URL from SourceCode constants", () => {
    const getConstants = jest
      .spyOn(NativeModules.SourceCode, "getConstants")
      .mockReturnValue({
        scriptURL: "http://localhost:8081/index.bundle"
      });

    expect(metroHostFromSourceUrl(metroSourceUrlFromNativeModules())).toBe(
      "localhost"
    );

    getConstants.mockRestore();
  });

  it("accepts only HTTP(S) Metro URLs", () => {
    expect(metroHostFromSourceUrl("http://localhost:8081/index.bundle")).toBe(
      "localhost"
    );
    expect(
      metroHostFromSourceUrl("http://192.168.1.10:8081/index.bundle")
    ).toBe("192.168.1.10");
    expect(metroHostFromSourceUrl("http://[::1]:8081/index.bundle")).toBe(
      "[::1]"
    );
    expect(
      metroHostFromSourceUrl("ws://secret.example/index.bundle")
    ).toBeUndefined();
    expect(metroHostFromSourceUrl("file:///index.bundle")).toBeUndefined();
    expect(metroHostFromSourceUrl(undefined)).toBeUndefined();
    expect(metroHostFromSourceUrl("not a URL")).toBeUndefined();
  });

  it("redacts inspection payloads", () => {
    const snapshot = serializeInspectionEvent({
      type: "@xstate.snapshot",
      rootId: "root",
      sessionId: "session",
      createdAt: "now",
      id: "id",
      _version: "1",
      event: { type: "submit", secret: "sentinel" },
      snapshot: {
        status: "active",
        value: "idle",
        context: { secret: "sentinel" },
        output: "secret"
      }
    } as unknown as StatelyInspectionEvent);
    const event = serializeInspectionEvent({
      type: "@xstate.event",
      rootId: "root",
      sessionId: "session",
      createdAt: "now",
      id: "id",
      _version: "1",
      sourceId: undefined,
      event: { type: "submit", secret: "sentinel" }
    } as unknown as StatelyInspectionEvent);
    const actor = serializeInspectionEvent({
      type: "@xstate.actor",
      rootId: undefined,
      sessionId: "session",
      createdAt: "now",
      id: "id",
      _version: "1",
      name: "machine",
      definition: '{"id":"machine"}',
      parentId: undefined,
      snapshot: {
        status: "active",
        value: "idle",
        context: { secret: "sentinel" },
        output: "secret"
      }
    } as unknown as StatelyInspectionEvent);

    expect(snapshot).toEqual(
      expect.objectContaining({
        event: { type: "submit" },
        snapshot: { status: "active", value: "idle", context: {} }
      })
    );
    expect(event).toEqual(
      expect.objectContaining({ event: { type: "submit" } })
    );
    expect(actor).toEqual(
      expect.objectContaining({
        name: "machine",
        snapshot: { status: "active", value: "idle", context: {} }
      })
    );
    expect(JSON.stringify({ snapshot, event, actor })).not.toContain(
      "sentinel"
    );
  });
});
