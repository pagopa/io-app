import { createActor } from "xstate";
import { itwRemoteMachine } from "../machine.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";

describe("itwRemoteMachine", () => {
  const mockedMachine = itwRemoteMachine.provide({
    actions: {},
    actors: {},
    guards: {}
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
  });

  it("should transition from Idle to RemoteRequestValidation when receiving start event", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      payload: {
        clientId: T_CLIENT_ID,
        requestUri: T_REQUEST_URI,
        state: T_STATE
      }
    });

    expect(actor.getSnapshot().value).toStrictEqual("RemoteRequestValidation");
    expect(actor.getSnapshot().context.payload).toStrictEqual({
      clientId: T_CLIENT_ID,
      requestUri: T_REQUEST_URI,
      state: T_STATE
    });
  });
});
