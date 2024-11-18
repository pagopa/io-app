import { addMinutes, differenceInSeconds, isPast } from "date-fns";
import { assign, fromPromise, setup } from "xstate";
import { ItwTags } from "../../machine/tags";
import { Context } from "./context";
import { Input } from "./input";
import { GetCredentialTrustmarkUrlActorInput } from "./actors";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwTrustmarkMachine = setup({
  types: {
    context: {} as Context,
    input: {} as Input
  },
  actions: {
    setExpirationDate: assign(() => ({
      expirationDate: addMinutes(new Date(), 2),
      expirationSeconds: 120
    })),
    updateExpirationSeconds: assign(({ context }) => ({
      expirationSeconds: context.expirationDate
        ? differenceInSeconds(context.expirationDate, new Date())
        : undefined
    }))
  },
  actors: {
    getCredentialTrustmarkUrlActor: fromPromise<
      string,
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
        src: "getCredentialTrustmarkUrlActor",
        input: ({ context }) => ({ credential: context.credential }),
        onDone: {
          target: "Displaying",
          actions: [
            "setExpirationDate",
            assign(({ event }) => ({ trustmarkUrl: event.output }))
          ]
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
