import type { StatelyInspectionEvent } from "@statelyai/inspect";

import { NativeModules } from "react-native";

import {
  createBatchingAdapter,
  createBrowserInspector,
  inspectorEndpointFromSourceUrl,
  metroSourceUrlFromNativeModules
} from "../createBrowserInspector";

/** Minimal event stand-in: the adapter only serializes what it is given. */
const inspectedEvent = (id: string): StatelyInspectionEvent =>
  ({ type: "@xstate.event", id }) as unknown as StatelyInspectionEvent;

const idsIn = (body: string): Array<string> =>
  (JSON.parse(body) as Array<StatelyInspectionEvent>).map(
    event => (event as { id: string }).id
  );

/** The flush the adapter handed to `schedule`, so it can be run on demand. */
const pendingFlush = (schedule: jest.Mock): (() => void) =>
  schedule.mock.calls[0][0] as () => void;

describe("inspectorEndpointFromSourceUrl", () => {
  test.each([
    {
      name: "keeps the Metro host and port",
      source: "http://localhost:8081/index.bundle",
      expected: "http://localhost:8081/xstate-inspector/ingest"
    },
    {
      name: "keeps a non-default port",
      source: "http://192.168.1.10:9000/index.bundle",
      expected: "http://192.168.1.10:9000/xstate-inspector/ingest"
    },
    {
      name: "falls back to the http port",
      source: "http://localhost/index.bundle",
      expected: "http://localhost:80/xstate-inspector/ingest"
    },
    {
      name: "falls back to the https port",
      source: "https://metro.example/index.bundle",
      expected: "https://metro.example:443/xstate-inspector/ingest"
    },
    {
      name: "keeps IPv6 hosts bracketed",
      source: "http://[::1]:8081/index.bundle",
      expected: "http://[::1]:8081/xstate-inspector/ingest"
    },
    {
      name: "rejects non-HTTP schemes",
      source: "ws://secret.example/index.bundle",
      expected: undefined
    },
    {
      name: "rejects file URLs",
      source: "file:///index.bundle",
      expected: undefined
    },
    {
      name: "rejects unparsable values",
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
      .mockReturnValue({
        scriptURL: "http://localhost:8081/index.bundle"
      });

    expect(
      inspectorEndpointFromSourceUrl(metroSourceUrlFromNativeModules())
    ).toBe("http://localhost:8081/xstate-inspector/ingest");

    getConstants.mockRestore();
  });
});

describe("createBrowserInspector", () => {
  it("does not create an inspector in test environments", () => {
    expect(createBrowserInspector()).toBeUndefined();
  });
});

describe("createBatchingAdapter", () => {
  it("holds events until the scheduled flush runs", () => {
    const post = jest.fn();
    const schedule = jest.fn(() => () => undefined);
    const adapter = createBatchingAdapter({ post, schedule });

    adapter.send(inspectedEvent("a"));
    adapter.send(inspectedEvent("b"));
    expect(post).not.toHaveBeenCalled();

    pendingFlush(schedule)();
    expect(post).toHaveBeenCalledTimes(1);
    expect(idsIn(post.mock.calls[0][0])).toEqual(["a", "b"]);
  });

  it("schedules one flush per batch, and another after it runs", () => {
    const post = jest.fn();
    const schedule = jest.fn(() => () => undefined);
    const adapter = createBatchingAdapter({ post, schedule });

    adapter.send(inspectedEvent("a"));
    adapter.send(inspectedEvent("b"));
    expect(schedule).toHaveBeenCalledTimes(1);

    pendingFlush(schedule)();
    adapter.send(inspectedEvent("c"));
    expect(schedule).toHaveBeenCalledTimes(2);
  });

  it("flushes a full burst without waiting for the timer", () => {
    const post = jest.fn();
    const cancel = jest.fn();
    const schedule = jest.fn(() => cancel);
    const adapter = createBatchingAdapter({ post, schedule });

    Array.from({ length: 50 }, (_, index) =>
      inspectedEvent(`e${index}`)
    ).forEach(event => adapter.send(event));

    expect(post).toHaveBeenCalledTimes(1);
    expect(idsIn(post.mock.calls[0][0])).toHaveLength(50);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending flush once it has been flushed", () => {
    const post = jest.fn();
    const cancel = jest.fn();
    const adapter = createBatchingAdapter({
      post,
      schedule: () => cancel
    });

    adapter.send(inspectedEvent("a"));
    adapter.stop();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("does not post when there is nothing pending", () => {
    const post = jest.fn();
    const adapter = createBatchingAdapter({
      post,
      schedule: () => () => undefined
    });

    adapter.stop();

    expect(post).not.toHaveBeenCalled();
  });

  it("flushes pending events when stopped", () => {
    const post = jest.fn();
    const adapter = createBatchingAdapter({
      post,
      schedule: () => () => undefined
    });

    adapter.send(inspectedEvent("a"));
    adapter.stop();

    expect(idsIn(post.mock.calls[0][0])).toEqual(["a"]);
  });

  it("survives a posting failure", () => {
    const post = jest.fn(() => {
      throw new Error("bridge unavailable");
    });
    const schedule = jest.fn(() => () => undefined);
    const adapter = createBatchingAdapter({ post, schedule });

    adapter.send(inspectedEvent("a"));

    expect(() => pendingFlush(schedule)()).not.toThrow();
  });

  it("contains events that cannot be serialized", () => {
    const post = jest.fn();
    const schedule = jest.fn(() => () => undefined);
    const adapter = createBatchingAdapter({ post, schedule });

    adapter.send({
      type: "@xstate.actor",
      id: "circular",
      context: { value: BigInt(1) }
    } as unknown as StatelyInspectionEvent);
    expect(() => pendingFlush(schedule)()).not.toThrow();

    // The poisoned batch is dropped, not retried on the next flush.
    adapter.send(inspectedEvent("b"));
    pendingFlush(schedule)();
    expect(idsIn(post.mock.calls[0][0])).toEqual(["b"]);
  });
});
