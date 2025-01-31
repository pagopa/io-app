import { assign, setup } from "xstate";
import { ItwTags } from "../../../machine/tags";
import { InitialContext, Context } from "./context";
import { mapEventToFailure } from "./failure";
import { RemoteEvents } from "./events";

export const itwRemoteMachine = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) }))
  },
  actors: {},
  guards: {}
}).createMachine({
  id: "itwRemoteMachine",
  context: { ...InitialContext },
  initial: "Idle",
  states: {
    Idle: {
      description:
        "The machine is in idle, ready to start the remote presentation flow",
      on: {
        start: {
          actions: assign(({ event }) => ({
            qrCodePayload: event.qrCodePayload
          })),
          target: "QRCodeValidation"
        }
      }
    },
    QRCodeValidation: {
      description: "Validating the QR code data before proceeding",
      tags: [ItwTags.Loading]
    },
    Failure: {
      description: "This state is reached when an error occurs"
    }
  }
});

export type ItwRemoteMachine = typeof itwRemoteMachine;
