import { setup } from "xstate";
import { Context, getInitialContext } from "./context";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCredentialUpgradeMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input
  },
  actions: {
    storeCredential: notImplemented
  }
}).createMachine({
  id: "itwCredentialUpgradeMachine",
  context: ({ input }) => getInitialContext(input),
  states: {
    Idle: {}
  }
});

export type ItwCredentialUpgradeMachine = typeof itwCredentialUpgradeMachine;
