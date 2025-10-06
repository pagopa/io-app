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
    storeCredential: notImplemented,
    pickNextCredential: assign({
      credentialIndex: ({ context }) => context.credentialIndex + 1
    }),
    setFailedCredential: assign({
      failedCredentials: ({ context }) => [
        ...context.failedCredentials,
        context.credentials[context.credentialIndex]
      ]
    })
  },
  actors: {
    upgradeCredential: fromPromise<
      UpgradeCredentialOutput,
      UpgradeCredentialParams
    >(notImplemented)
  },
  guards: {
    hasMoreCredentials: ({ context }) =>
      context.credentialIndex < context.credentials.length - 1
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsAuB3AwgJ0mAdqsgIYA2AqgA5TbERgCyxAxgBbL5gB0mrYzAaw5QAxAG0ADAF1EoSgHtYaZPPyyQAD0QA2ACwBOLgHZ92gBx6AzPssSjZgDQgAnogCMAVkvGATNo8eFmYS5mb6PgC+EU5oWLj0hCQU1LT0TGwc3Lz8QviiYm4ySCAKSkSq6loIlnpcEmYe4dpGHm76Nk6uCGZuXAbtYWESdroSHlExGDh4iWRUNHSMLOycXPOpYNMJRGQiEKrcHABu8gKHU-EEO8kLacuZaymLW1dJCMfyzMTl+JJSf+pSsoKsUqrYfFx9EZ-IE3D4fG4JLoPJ1EPCJJCvHCjLojG5bJYzBMQLEXrMbht0ituOtnpdySIwNhsPJsFxKKRvgAzVkAWy4pPp11pdwyqxFmyFbw+Xx+fwBxSBP0qiHBkOhAR68MRyNRCGxfXaULc5iM9jaRii0RA+Hk9HgxUFM2FT1F1MBimBalBiAAtNo9f66sMQ6GQwjiU7tkkJVSHtlBMIPWUVN7QFUPH5IQiLIEfEYQj5HC53K11f4LHYfJZGuZIxdnTHXUsxTTm2TrsmvSqELofHq3GauLZcR49OY-JYfLp63FG3Nm3HVph5LyOWBUJAu8qfQh7Lo+mZdDVkfoTRI3LoBx4MUY-K0zJZB24jzOrUA */
  id: "itwCredentialUpgradeMachine",
  context: ({ input }) => getInitialContext(input),
  initial: "Checking",
  states: {
    Checking: {
      always: [
        {
          guard: "hasMoreCredentials",
          actions: "pickNextCredential",
          target: "UpgradeCredential"
        },
        {
          target: "Completed"
        }
      ]
    },
    UpgradeCredential: {
      invoke: {
        src: "upgradeCredential",
        input: ({ context }) => ({
          pid: context.pid,
          walletInstanceAttestation: context.walletInstanceAttestation,
          credential: context.credentials[context.credentialIndex],
          issuanceMode: context.issuanceMode
        }),
        onDone: {
          actions: ["storeCredential"],
          target: "Checking"
        },
        onError: {
          actions: ["setFailedCredential"],
          target: "Checking"
        }
      }
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
