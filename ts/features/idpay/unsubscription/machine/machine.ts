import { assertEvent, fromPromise, setup } from "xstate5";
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
    navigateToConfirmationScreen: () => {
      throw new Error("Not implemented");
    },
    navigateToResultScreen: () => {
      throw new Error("Not implemented");
    },
    exitToWallet: () => {
      throw new Error("Not implemented");
    },
    exitUnsubscription: () => {
      throw new Error("Not implemented");
    },
    handleSessionExpired: () => {
      throw new Error("Not implemented");
    }
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
      !!context.initiativeName || !!context.initiativeType,
    isSessionExpired: data => {
      // eslint-disable-next-line no-console
      console.log(data);
      return false;
    }
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
    onDone: [
      {
        guard: "hasMissingInitiativeData",
        target: ".LoadingInitiativeInfo"
      },
      {
        target: ".Idle"
      }
    ]
  },
  initial: "Idle",
  states: {
    Idle: {
      tags: [LOADING_TAG]
    },
    LoadingInitiativeInfo: {
      tags: [LOADING_TAG],
      invoke: {
        input: ({ context }) => context.initiativeId,
        src: "getInitiativeInfo",
        onError: [
          {
            guard: "isSessionExpired",
            target: ".SessionExpired"
          },
          {
            target: ".UnsubscriptionFailure"
          }
        ],
        onDone: {
          target: ".WaitingConfirmation"
        }
      }
    },
    WaitingConfirmation: {
      tags: [WAITING_USER_INPUT_TAG],
      on: {
        "confirm-unsubscription": {
          target: ".Unsubscribing"
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
            target: ".SessionExpired"
          },
          {
            target: ".UnsubscriptionFailure"
          }
        ],
        onDone: {
          target: ".UnsubscriptionSuccess"
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
