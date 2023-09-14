import { createMachine } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../xstate/utils";
import { Context, INITIAL_CONTEXT } from "./context";

const createIDPayCodeOnboardingMachine = (isCodeEnabled: boolean) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoGFkBRXAeQDkAhUzAJVWXIHEBiJ03SzfAaQG0ADAF1EoAA4B7WAEsALtIkA7USAAeiAMwBGACwA6DToBMRrRoCcRgOwBWDTYBsAGhABPRAIC+nl2ix5CEgpqOgZmFgAxRmQAZQAJQREkEEkZeSUVdQQBF3ds718MHAJiMioaekYmPQYY9AAZHCrcRgAVWlIWGNa6VtwI+tIAdUSVVLkFZWSsk30rKy07XS0BLSNzHVzEGxsjPQcjAA4NBy0HQ6PHApA-YsCykMrmPUwAVVa40lpkAC1m15iRFoLDeH1wMVe+HwRBiMVGyXG6SmoCyNnMAj06J0h0OZg0AmOWi0WwQO3MehsOhsAgE2LJxgc11uAVKwQqYWqoM+3z+zFwAKBIPecXBkOhsL4WiS4ikEwy00Qlgceh0VksGg0RhsZiJmzc2zRFJ0OnM5gc5w0VgEGiZRRZQXKoSqL2FX1+-0BwK5-UwyHqr1oRHhMrSk0yiGNWkxtlW5nxZotVhJxisekONNM8x0DhNq1t-hKDseHL0TCI5CBmFazXQjBYtfIuDLFdoVaIqGDKVlSPDCDOJj0qxxVhMlNsNhJZKN1PxZzRJkO+burMdT2qzcr1b5DfrjCb5c3yAoPr9AaDwjG3bDCr7WgWKpHaw1hjW5hJhhsekWhwcNPmAg2O8l3tB52WdeJhhrOt8AoLdXnPaUu1DeUUUQLRjk-Q5dgcbUdl0bUNBJKx8QpVZaWzcxHBMIxvB8EBFAkCA4BUZlC1Ap1mEvZDkTURAAFojAxONv1-XRtEcEktVTHCsMo7UiQEBwrGAti2Q46pagaJo+TaDouLlHiZlTRTDh0MxzCw85jUnOwvyOE4zguSyVPuNS1xdD43V5Jh+U9fSexvDQf0HC1zF0JTTDMJN9VJWy1mOU5zkuRk6NY1zVxLDdWy3HyG3869UL7ewowAtFfyMDUcNpGy9i0dFCXMK0zAEGwXJXYtwM+IYoPIfKUN4vsLn0bUlKsY1BNMCcYqnSlqVpLC0RTNqizA55NMabBmjcjlRShGEYj6wzEGI5UdEUqwcPNU04ymvIR0-VZ1nOBYLAcONlvY9z1u0nztuaCJfX9QNDt7BwSJ0fF7AuzULLjd9tUHDUVkm+SP1ozwgA */
      context: { ...INITIAL_CONTEXT, isCodeEnabled },
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: undefined,
        services: undefined
      },
      predictableActionArguments: true,
      id: "IDPAY_CODE_ONBOARDING",
      initial: "DISPLAYING_INTRO",
      on: {
        GO_BACK: {
          actions: "quitFlow"
        },
        FINISH: {
          actions: "quitFlow"
        }
      },
      states: {
        DISPLAYING_INTRO: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            START_FLOW: {
              target: "AUTHORIZING_USER"
            }
          }
        },
        AUTHORIZING_USER: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            AUTH_SUCCESS: [
              {
                cond: "pin_exists",
                target: "DISPLAYING_ONBOARDING_SUCCESS"
              },
              {
                target: "GENERATING_PIN"
              }
            ],
            AUTH_FAILURE: {
              target: "DISPLAYING_ONBOARDING_FAILURE"
            }
          }
        },
        GENERATING_PIN: {
          tags: [LOADING_TAG],
          invoke: {
            id: "generatePin",
            src: "generatePin",
            onDone: {
              target: "SHOWING_PIN"
            },
            onError: {
              target: "DISPLAYING_ONBOARDING_FAILURE"
            }
          }
        },
        SHOWING_PIN: {
          entry: "navigateToPinShowScreen",
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            CONTINUE: {
              target: "DISPLAYING_ONBOARDING_SUCCESS"
            }
          }
        },
        DISPLAYING_ONBOARDING_SUCCESS: {
          entry: "navigateToSuccessScreen",
          tags: [WAITING_USER_INPUT_TAG]
        },
        DISPLAYING_ONBOARDING_FAILURE: {
          entry: "navigateToErrorScreen",
          tags: [WAITING_USER_INPUT_TAG]
        }
      }
    },
    {
      guards: {
        // this comes from the global state, context will contain the original value
        pin_exists: (context: Context) => context.isCodeEnabled
      }
    }
  );

type IDPayCodeOnboardingMachineType = ReturnType<
  typeof createIDPayCodeOnboardingMachine
>;
export type { IDPayCodeOnboardingMachineType };
export { createIDPayCodeOnboardingMachine };
