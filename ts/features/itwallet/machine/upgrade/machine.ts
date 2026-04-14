import { assign, fromCallback, fromPromise, setup } from "xstate";
import { ItwSessionExpiredError } from "../../api/client";
import {
  RequestAccessTokenOutput,
  RequestAccessTokenParams,
  UpgradeCredentialOutput,
  UpgradeCredentialParams
} from "./actors";
import { Context, getInitialContext } from "./context";
import { CredentialUpgradeEvents } from "./events";
import { mapUpgradeEventToFailure } from "./failure";
import { Input } from "./input";
import { Output } from "./output";

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
      failedCredentials: ({ context, event }) => {
        const current = context.credentials[context.credentialIndex];

        const failedEvent = mapUpgradeEventToFailure(event);

        const failedCredential = {
          ...current,
          failure: {
            type: failedEvent.type,
            reason: failedEvent.reason
          }
        };

        return [...context.failedCredentials, failedCredential];
      }
    }),
    handleSessionExpired: notImplemented
  },
  actors: {
    requestAccessToken: fromPromise<
      RequestAccessTokenOutput,
      RequestAccessTokenParams
    >(notImplemented),
    upgradeCredential: fromPromise<
      UpgradeCredentialOutput,
      UpgradeCredentialParams
    >(notImplemented),
    waitForSessionRefresh: fromCallback(notImplemented)
  },
  guards: {
    isSessionExpired: ({ event }) =>
      "error" in event && event.error instanceof ItwSessionExpiredError,
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
          target: "RequestAccessToken"
        },
        {
          target: "Completed"
        }
      ]
    },
    RequestAccessToken: {
      invoke: {
        src: "requestAccessToken",
        input: ({ context }) => ({
          pid: context.pid,
          walletInstanceAttestation: context.walletInstanceAttestation,
          credential: context.credentials[context.credentialIndex],
          issuanceMode: context.issuanceMode
        }),
        onDone: {
          target: "UpgradeCredential",
          actions: assign(({ event }) => event.output)
        },
        onError: {
          actions: ["setFailedCredential"],
          target: "Checking"
        }
      }
    },
    UpgradeCredential: {
      invoke: {
        description:
          "Obtain the credential(s) with the WUA if supported. This state is retried when the session expires, so it must contain the minimal retriable logic to obtain the credential",
        src: "upgradeCredential",
        id: "upgradeCredential",
        input: ({ context }) => ({
          pid: context.pid,
          credential: context.credentials[context.credentialIndex],
          accessToken: context.accessToken!,
          issuerConf: context.issuerConf!,
          clientId: context.clientId!,
          integrityKeyTag: context.integrityKeyTag,
          issuanceMode: context.issuanceMode
        }),
        onDone: {
          actions: ["storeCredential"],
          target: "Checking"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "WaitingForSessionRefresh"
          },
          {
            actions: ["setFailedCredential"],
            target: "Checking"
          }
        ]
      }
    },
    WaitingForSessionRefresh: {
      invoke: {
        src: "waitForSessionRefresh"
      },
      on: {
        "session-refresh-complete": { target: "UpgradeCredential" }
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
