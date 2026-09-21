import type { InspectionEvent } from "xstate";

import { NativeModules } from "react-native";

import {
  createBrowserInspector,
  inspectorEndpointFromSourceUrl,
  metroSourceUrlFromNativeModules,
  toStatelyInspectionEvent
} from "../createBrowserInspector";

describe("inspectorEndpointFromSourceUrl", () => {
  test.each([
    {
      name: "uses the fixed inspector port on localhost",
      source: "http://localhost:8081/index.bundle",
      expected: "ws://localhost:5173/xstate-inspector/runtime"
    },
    {
      name: "uses the Metro host of a physical device",
      source: "http://192.168.1.10:8081/index.bundle",
      expected: "ws://192.168.1.10:5173/xstate-inspector/runtime"
    },
    {
      name: "keeps IPv6 hosts bracketed",
      source: "http://[::1]:8081/index.bundle",
      expected: "ws://[::1]:5173/xstate-inspector/runtime"
    },
    {
      name: "rejects non-HTTP schemes",
      source: "file:///index.bundle",
      expected: undefined
    },
    {
      name: "rejects malformed values",
      source: "not a URL",
      expected: undefined
    },
    {
      name: "rejects non-strings",
      source: undefined,
      expected: undefined
    }
  ])("$name", ({ source, expected }) => {
    expect(inspectorEndpointFromSourceUrl(source)).toBe(expected);
  });
});

describe("metroSourceUrlFromNativeModules", () => {
  it("reads the bundle URL from SourceCode constants", () => {
    const getConstants = jest
      .spyOn(NativeModules.SourceCode, "getConstants")
      .mockReturnValue({ scriptURL: "http://localhost:8081/index.bundle" });

    expect(metroSourceUrlFromNativeModules()).toBe(
      "http://localhost:8081/index.bundle"
    );

    getConstants.mockRestore();
  });
});

describe("createBrowserInspector", () => {
  it("stays disabled in Jest", () => {
    expect(createBrowserInspector()).toBeUndefined();
  });
});

describe("toStatelyInspectionEvent", () => {
  it("keeps raw event data and marks circular values", () => {
    const payload: Record<string, unknown> = { type: "continue" };
    payload.circular = payload;
    const converted = toStatelyInspectionEvent({
      type: "@xstate.event",
      rootId: "root",
      actorRef: { sessionId: "actor" },
      sourceRef: undefined,
      event: payload
    } as InspectionEvent);

    expect(converted).toMatchObject({
      type: "@xstate.event",
      rootId: "root",
      sessionId: "actor",
      event: { type: "continue", circular: "[Circular]" }
    });
  });
});
