import { assertEvent, assign, fromPromise, setup } from "xstate";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG,
  notImplementedStub
} from "../../../../xstate/utils";
import * as Context from "./context";
import * as Events from "./events";
import * as Input from "./input";

export const idPayUnsubscriptionMachine = setup({
  types: {
    input: {} as Input.Input,
    context: {} as Context.Context,
    events: {} as Events.Events
  },
  actions: {
    navigateToConfirmationScreen: notImplementedStub,
    navigateToResultScreen: notImplementedStub,
    exitToWallet: notImplementedStub,
    exitUnsubscription: notImplementedStub,
    handleSessionExpired: notImplementedStub
  },
  actors: {
    onInit: fromPromise<Context.Context, Input.Input>(({ input }) =>
      Input.Input(input)
    ),
    getInitiativeInfo: fromPromise<InitiativeDTO, string>(notImplementedStub),
    unsubscribeFromInitiative: fromPromise<undefined, string>(
      notImplementedStub
    )
  },
  guards: {
    hasMissingInitiativeData: ({ context }) =>
      context.initiativeName === undefined ||
      context.initiativeType === undefined,
    isSessionExpired: () => false
  }
}).createMachine({
  id: "idpay-unsubscription",
  context: Context.Context,
  entry: "navigateToConfirmationScreen",
  invoke: {
    src: "onInit",
    input: ({ event }) => {
      assertEvent(event, "xstate.init");
      return event.input;
    },
    onError: {
      target: ".UnsubscriptionFailure"
    },
    onDone: {
      actions: assign(event => ({ ...event.event.output })),
      target: ".Idle"
    }
  },
  initial: "Idle",
  states: {
    Idle: {
      tags: [LOADING_TAG],
      always: [
        {
          guard: "hasMissingInitiativeData",
          target: "LoadingInitiativeInfo"
        },
        {
          target: "WaitingConfirmation"
        }
      ]
    },
    LoadingInitiativeInfo: {
      tags: [LOADING_TAG],
      invoke: {
        input: ({ context }) => context.initiativeId,
        src: "getInitiativeInfo",
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "UnsubscriptionFailure"
          }
        ],
        onDone: {
          actions: assign(({ event }) => ({
            initiativeId: event.output.initiativeId,
            initiativeName: event.output.initiativeName,
            initiativeType: event.output.initiativeRewardType
          })),
          target: "WaitingConfirmation"
        }
      }
    },
    WaitingConfirmation: {
      tags: [WAITING_USER_INPUT_TAG],
      on: {
        "confirm-unsubscription": {
          target: "Unsubscribing"
        },
        exit: {
          actions: "exitUnsubscription"
        }
      }
    },
    Unsubscribing: {
      tags: [LOADING_TAG],
      invoke: {
        input: ({ context }) => context.initiativeId,
        src: "unsubscribeFromInitiative",
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "UnsubscriptionFailure"
          }
        ],
        onDone: {
          target: "UnsubscriptionSuccess"
        }
      }
    },
    UnsubscriptionSuccess: {
      entry: "navigateToResultScreen",
      on: {
        exit: {
          actions: "exitToWallet"
        }
      }
    },
    UnsubscriptionFailure: {
      entry: "navigateToResultScreen",
      on: {
        exit: {
          actions: "exitUnsubscription"
        }
      }
    },
    SessionExpired: {
      entry: ["handleSessionExpired", "exitUnsubscription"]
    }
  }
});

export type IdPayUnsubscriptionMachine = typeof idPayUnsubscriptionMachine;
