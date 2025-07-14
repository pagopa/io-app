import { assign, fromCallback, fromPromise, setup } from "xstate";
import { CieError } from "@pagopa/io-react-native-cie";
import { CieContext, getInitialContext } from "./context";
import { CieInput } from "./input";
import { CieEvents } from "./events";
import { CieManagerActorInput, StartCieManagerInput } from "./actors";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCieMachine = setup({
  types: {
    input: {} as CieInput,
    context: {} as CieContext,
    events: {} as CieEvents
  },
  actors: {
    startCieManager: fromPromise<void, StartCieManagerInput>(notImplemented),
    cieManagerActor: fromCallback<CieEvents, CieManagerActorInput>(
      notImplemented
    )
  },
  actions: {
    resetReadingState: assign(() => ({
      readProgress: undefined,
      authorizationUrl: undefined,
      redirectUrl: undefined,
      failure: undefined
    })),
    configureStatusAlerts: notImplemented,
    updateStatusAlert: notImplemented,
    trackError: notImplemented
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsAuB3AwssBZAhgMYAWyAdmAHQCSZaAxANoAMAuoqAA4D2say3MhxAAPRAGYAbAEZKAFgDskgKySAnHIBM4qXPEKANCACeE5bOnrpS85Ln25ygL5OjaLDgIlyVAGJhUbzIoelgAgFowgCcAN2RCMHDOKO44iDAo8IBXKIAbFnYkEB4+VAEhIrEEAA4ZSklxTTUdTSbpNUMTCU1JerUeuUkeqWlHSRc3DGw8IlIKSgAlMHwIcihMfCiIegyUqMpOXPxUADNuKIBbSlhUTdRpgjJ8GCiC4RL+QWEqy0lmeuUamUzDklnEcmYjSMpgQ0mk1UomlUCiRakhciBjQmIHcD1mPkWy1WwQ2W3ohBw4SiRPCYBiYDIqDeRQ+ZS+lUQ0iR4kRzAU0mBzHh1U01WU0M5cgRGmYzGq0nEYoxKOxuM8+PmSxWa1J2wpiWpK1pUT2zK4vE+FVAP0k8soOn6zDUzukzE0TolCHEzF64ms4jRkP5wO0qqm6qCVC1xPWmz1lMNEEiWUICVgsDNxQtbKtok5gLklAUQrd7TU1TdSM9ygUhcB1Skwfd1mkYY8M0jlAAgllUMRzsgAF5rcncC6HAKJfC94gMsqEY7lTOs8rfRCaRyFhQKP0KMVAhVqSTV4GUBV-TQKVTKZStNQuVwgMjcdLwIpqjtzMDvbOrjkIcJjy6ADLERPRhhFLkOm3OQ2zxTtaDQH9Sj-a1EC0T0-X+NR2ndflJD+cxNDgiMv0ofxAjmKBkMtNcEDGShVB6EEayaOVqk6GFGgUSgcP6OFASUaoNAUEjPwJaMdTjGiczouFZUoDjzAxRVMQFTC-URW9lADWshnhZxHw-LwyJ7PsB2HYIZNQvNYXlOsQX0fp3QhTRq23XiUVtd0dJc6oxJMglMDHCdUEgaz2TQhANwxRTlOURQ0Qaao5A0zQi0UN17D5JEUVgozw3E+ZfHwZBchyb8WV-SLbPaCEMorQYkVaKVxDSjLi1vK8-ilZhDJcIA */
  id: "itwCieMachine",
  context: ({ input }) => getInitialContext(input),
  initial: "Init",
  invoke: {
    src: "cieManagerActor",
    id: "cieManagerActor",
    input: ({ context }) => ({
      isScreenReaderEnabled: context.isScreenReaderEnabled
    })
  },
  states: {
    Init: {
      description: "Initializes CieManager and status alerts (iOS)",
      entry: "configureStatusAlerts",
      always: "WaitingForUrl"
    },
    WaitingForUrl: {
      description:
        "Waits for the service provider url to start the authentication flow",
      on: {
        "set-service-provider-url": {
          actions: assign(({ event }) => ({ serviceProviderUrl: event.url })),
          target: "ReadingCard"
        },
        "webview-error": {
          actions: assign(({ event }) => ({
            failure: { name: "WEBVIEW_ERROR", message: event.message }
          })),
          target: "Failure"
        }
      }
    },
    ReadingCard: {
      description:
        "Starts the NFC card read and listens for NFC events, errors ans success",
      entry: "resetReadingState",
      invoke: {
        src: "startCieManager",
        id: "startCieManager",
        input: ({ context }) => ({
          pin: context.pin,
          serviceProviderUrl: context.serviceProviderUrl
        }),
        onError: {
          target: "Failure",
          actions: assign(({ event }) => ({ failure: event.error as CieError }))
        }
      },
      on: {
        "cie-read-event": {
          actions: [
            assign(({ context, event }) => ({
              readProgress: Math.max(
                context.readProgress || 0,
                event.event.progress
              )
            })),
            "updateStatusAlert"
          ]
        },
        "cie-read-error": {
          actions: assign(({ event }) => ({ failure: event.error })),
          target: "Failure"
        },
        "cie-read-success": {
          target: "Authorizing",
          actions: assign(({ event }) => ({
            authorizationUrl: event.authorizationUrl
          }))
        }
      }
    },
    Authorizing: {
      description:
        "Displaying authorization wwebview and waiting for the redirection url with the authentication",
      on: {
        "complete-authentication": {
          actions: assign(({ event }) => ({ redirectUrl: event.redirectUrl })),
          target: "Completed"
        },
        "webview-error": {
          actions: assign(({ event }) => ({
            failure: { name: "WEBVIEW_ERROR", message: event.message }
          })),
          target: "Failure"
        }
      }
    },
    Completed: {
      description: "Authentication flow completed",
      type: "final"
    },
    Failure: {
      description: "Authentication flow terminated with error",
      entry: "trackError",
      on: {
        retry: {
          target: "WaitingForUrl"
        }
      }
    }
  }
});

export type ItwCieMachine = typeof itwCieMachine;
