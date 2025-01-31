import { createActor } from "xstate";
import { itwRemoteMachine } from "../machine.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";

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

  it("should transition from Idle to QRCodeValidation when receiving start event", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      qrCodePayload: { clientId: T_CLIENT_ID, requestUri: T_REQUEST_URI }
    });

    expect(actor.getSnapshot().value).toStrictEqual("QRCodeValidation");
    expect(actor.getSnapshot().context.qrCodePayload).toStrictEqual({
      clientId: T_CLIENT_ID,
      requestUri: T_REQUEST_URI
    });
  });
});
