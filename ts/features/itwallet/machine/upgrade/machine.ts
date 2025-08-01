import { assign, fromPromise, setup } from "xstate";
import { UpgradeCredentialOutput, UpgradeCredentialParams } from "./actors";
import { Context, getInitialContext } from "./context";
import { Input } from "./input";
import { Output } from "./output";
import { CredentialUpgradeEvents } from "./events";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCredentialUpgradeMachine = setup({
  types: {
    events: {} as CredentialUpgradeEvents,
    context: {} as Context,
    input: {} as Input,
    output: {} as Output
  },
  actions: {
    storeCredential: notImplemented
  },
  actors: {
    upgradeCredential: fromPromise<
      UpgradeCredentialOutput,
      UpgradeCredentialParams
    >(notImplemented)
  }
}).createMachine({
  id: "itwCredentialUpgradeMachine",
  context: ({ input }) => getInitialContext(input),
  initial: "Checking",
  states: {
    Checking: {
      always: [
        {
          guard: ({ context }) => context.credentials.length === 0,
          target: "Completed"
        },
        {
          target: "UpgradeCredential"
        }
      ]
    },
    UpgradeCredential: {
      invoke: {
        src: "upgradeCredential",
        input: ({ context }) => ({
          pid: context.pid,
          walletInstanceAttestation: context.walletInstanceAttestation,
          credential: context.credentials[0]
        }),
        onDone: {
          actions: ["storeCredential"],
          target: "Checking"
        },
        onError: {
          actions: [
            assign({
              failedCredentials: ({ context }) => [
                ...context.failedCredentials,
                context.credentials[0]
              ]
            })
          ],
          target: "Checking"
        }
      },
      exit: assign({
        credentials: ({ context }) => context.credentials.slice(1)
      })
    },
    Completed: {
      type: "final"
    }
  },
  output: ({ context }) => ({
    failedCredentials: context.failedCredentials
  })
});

export type ItwCredentialUpgradeMachine = typeof itwCredentialUpgradeMachine;
