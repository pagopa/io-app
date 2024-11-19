import { differenceInSeconds, isPast } from "date-fns";
import { assign, fromPromise, setup } from "xstate";
import { ItwTags } from "../../machine/tags";
import {
  GetCredentialTrustmarkUrlActorInput,
  GetCredentialTrustmarkUrlActorOutput
} from "./actors";
import { Context } from "./context";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwTrustmarkMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input
  },
  actions: {
    updateExpirationSeconds: assign(({ context }) => ({
      expirationSeconds: context.expirationDate
        ? differenceInSeconds(context.expirationDate, new Date())
        : undefined
    }))
  },
  actors: {
    getCredentialTrustmarkActor: fromPromise<
      GetCredentialTrustmarkUrlActorOutput,
      GetCredentialTrustmarkUrlActorInput
    >(notImplemented)
  },
  guards: {
    isExpired: ({ context }) =>
      context.expirationDate ? isPast(context.expirationDate) : true
  }
}).createMachine({
  id: "itwTrustmarkMachine",
  context: ({ input }) => input,
  initial: "Refreshing",
  states: {
    Refreshing: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "getCredentialTrustmarkActor",
        input: ({ context }) => ({ credential: context.credential }),
        onDone: {
          target: "Displaying",
          actions: assign(({ event }) => ({
            trustmarkUrl: event.output.url,
            expirationDate: new Date(event.output.expirationTime * 1000)
          }))
        },
        onError: {
          target: "Failure"
        }
      }
    },
    Displaying: {
      initial: "Idle",
      states: {
        Idle: {
          after: {
            1000: {
              target: "Checking"
            }
          }
        },
        Checking: {
          entry: "updateExpirationSeconds",
          always: [
            {
              guard: "isExpired",
              actions: assign({ trustmarkUrl: undefined }),
              target: "#itwTrustmarkMachine.Refreshing"
            },
            {
              target: "Idle"
            }
          ]
        }
      }
    },
    Failure: {}
  }
});

export type ItwTrustmarkMachine = typeof itwTrustmarkMachine;
