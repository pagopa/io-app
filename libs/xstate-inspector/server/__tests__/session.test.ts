import { InspectorSession } from "../session.ts";

const runtime = { id: "one", appVersion: "1.0.0", platform: "ios" };

describe("InspectorSession", () => {
  it("replays only the configured event and byte window", () => {
    const session = new InspectorSession({ maxEvents: 2, maxBytes: 10 });
    session.replaceRuntime(runtime);

    session.append({ id: "a" }, 4);
    session.append({ id: "b" }, 4);
    session.append({ id: "c" }, 4);

    expect(session.snapshot()).toMatchObject({
      dropped: 1,
      events: [
        { event: { id: "b" }, size: 4 },
        { event: { id: "c" }, size: 4 }
      ]
    });
  });

  it("clears history when a new runtime replaces the old one", () => {
    const session = new InspectorSession({ maxEvents: 10, maxBytes: 100 });
    session.replaceRuntime(runtime);
    session.append({ id: "old" }, 4);

    session.replaceRuntime({ ...runtime, id: "two", platform: "android" });

    expect(session.snapshot()).toEqual({
      connected: true,
      dropped: 0,
      events: [],
      runtime: { id: "two", appVersion: "1.0.0", platform: "android" }
    });
  });

  it("counts events rejected by either side", () => {
    const session = new InspectorSession({ maxEvents: 10, maxBytes: 5 });
    session.replaceRuntime(runtime);

    expect(session.append({ id: "large" }, 6)).toBe(false);
    session.recordDropped(2);

    expect(session.snapshot().dropped).toBe(3);
  });
});
