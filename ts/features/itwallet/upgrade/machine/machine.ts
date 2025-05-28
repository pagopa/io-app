import { setup } from "xstate";
import { Context, InitialContext } from "./context";
import { Input } from "./input";
import { Output } from "./output";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCredentialUpgradeMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    output: {} as Output
  },
  actions: {
    storeCredential: notImplemented
  }
}).createMachine({
  id: "itwCredentialUpgradeMachine",
  context: ({ input }) => ({
    ...InitialContext,
    credentialsToUpgrade: input.credentialTypes
  }),
  initial: "Idle",
  states: {
    Idle: {}
  }
});

export type ItwCredentialUpgradeMachine = typeof itwCredentialUpgradeMachine;
