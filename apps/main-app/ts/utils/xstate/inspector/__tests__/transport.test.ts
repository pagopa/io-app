import type { StatelyInspectionEvent } from "@statelyai/inspect";

import type { InspectorSocket } from "../types";

import { createLazyInspectorTransport } from "../transport";

class FakeSocket implements InspectorSocket {
  public onclose: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public onopen: (() => void) | null = null;
  public readyState: InspectorSocket["readyState"] = 0;
  public readonly sent: Array<string> = [];

  public close = () => {
    this.readyState = 3;
    this.onclose?.();
  };

  public open = () => {
    this.readyState = 1;
    this.onopen?.();
  };

  public send = (data: string) => {
    this.sent.push(data);
  };
}

const event = (payload: unknown = { type: "next" }): StatelyInspectionEvent =>
  ({
    type: "@xstate.event",
    _version: "0.7.2",
    createdAt: "1",
    id: "event",
    rootId: "root",
    sessionId: "actor",
    sourceId: undefined,
    event: payload
  }) as StatelyInspectionEvent;

const runtime = { id: "runtime", appVersion: "1.0.0", platform: "ios" };

describe("createLazyInspectorTransport", () => {
  it("opens on the first event and sends the handshake first", () => {
    const sockets: Array<FakeSocket> = [];
    const transport = createLazyInspectorTransport("ws://inspector", runtime, {
      createSocket: () => {
        const socket = new FakeSocket();
        sockets.push(socket);
        return socket;
      },
      schedule: callback => setTimeout(callback, 0),
      unschedule: timer => clearTimeout(timer)
    });

    expect(sockets).toHaveLength(0);
    transport.send(event());
    expect(sockets).toHaveLength(1);
    expect(sockets[0].sent).toHaveLength(0);

    sockets[0].open();

    expect(sockets[0].sent.map(frame => JSON.parse(frame).type)).toEqual([
      "runtime-connected",
      "inspection-event"
    ]);
  });

  it("sends subsequent events on the open socket", () => {
    const socket = new FakeSocket();
    const transport = createLazyInspectorTransport("ws://inspector", runtime, {
      createSocket: () => socket,
      schedule: callback => setTimeout(callback, 0),
      unschedule: timer => clearTimeout(timer)
    });

    transport.send(event());
    socket.open();
    transport.send(event({ type: "again" }));

    expect(socket.sent.map(frame => JSON.parse(frame).type)).toEqual([
      "runtime-connected",
      "inspection-event",
      "inspection-event"
    ]);
  });

  it("reports an oversized event after a later connection", () => {
    const socket = new FakeSocket();
    const transport = createLazyInspectorTransport("ws://inspector", runtime, {
      createSocket: () => socket,
      schedule: callback => setTimeout(callback, 0),
      unschedule: timer => clearTimeout(timer)
    });

    transport.send(event({ value: "x".repeat(1024 * 1024) }));
    transport.send(event());
    socket.open();

    expect(socket.sent.map(frame => JSON.parse(frame).type)).toEqual([
      "runtime-connected",
      "events-dropped",
      "inspection-event"
    ]);
  });

  it("keeps one retry scheduled when socket creation fails", () => {
    const createSocket = jest.fn(() => {
      throw new Error("offline");
    });
    const schedule = jest.fn(
      () => Symbol() as unknown as ReturnType<typeof setTimeout>
    );
    const unschedule = jest.fn();
    const transport = createLazyInspectorTransport("ws://inspector", runtime, {
      createSocket,
      schedule,
      unschedule
    });

    transport.send(event());
    transport.send(event({ type: "still-offline" }));

    expect(createSocket).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenCalledTimes(1);
    transport.stop();
    expect(unschedule).toHaveBeenCalledTimes(1);
  });
});
