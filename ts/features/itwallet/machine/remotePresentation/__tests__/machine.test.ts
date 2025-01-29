import { createActor } from "xstate";
import { itwRemotePresentationMachine } from "../machine";

describe("itwRemotePresentationMachine", () => {
  const mockedMachine = itwRemotePresentationMachine.provide({
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
