import { createActor } from "xstate";
import { itwRemoteMachine } from "../machine.ts";

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
});
