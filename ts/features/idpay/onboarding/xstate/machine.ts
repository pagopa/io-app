import { assign, createMachine } from "xstate";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../utils/xstate";

// Context types
type Context = {
  serviceId?: string;
  initiativeId?: string;
  prerequisites?: {
    pdnd: boolean;
    self: boolean;
  };
};

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type E_ACCEPT_PDND_PREREQUISITES = {
  type: "ACCEPT_PDND_PREREQUISITES";
};

type E_ACCEPT_SELF_PREREQUISITES = {
  type: "ACCEPT_SELF_PREREQUISITES";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_ACCEPT_TOS
  | E_ACCEPT_PDND_PREREQUISITES
  | E_ACCEPT_SELF_PREREQUISITES;

// Services types
type Services = {
  loadInitiativeData: {
    data: { initiativeId: string };
  };
  acceptTos: {
    data: undefined;
  };
  loadPrerequisites: {
    data: {
      pdnd: boolean;
      self: boolean;
    };
  };
  acceptPrerequisites: {
    data: undefined;
  };
};

const createIDPayOnboardingMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgHUBBASQBUqA5AcQH0HaqK6A1AUWYGUeAGR4BhOgHl6AYkEjxreu05VeAbQAMAXUSgADgHtYuAC64D+XSAAeiAMx2ATCQCsLhwA4A7F4CcvjwBGRy8XABoQAE9EQO8SAI07ABYk7wCvR0cAXyyItCw8QlIhCQoAEQYWNjoVXmYyzgppCAswEgIANwMAazaAGwN0CCp8U1x0Mw6wMon0TR0kEENjMwsrWwQPDySSLw8ANhd9jS8HR3dHCOiEWK94j0SUtO9MnLyMHAJiEgr+AAUhBQAJqVRTKbh8Bo0JoUUSiHh-GjMGgSfjzKzLMZrRYbQJ2Xz7EhJFwElwPE4uLxJLxXRCOQKBEj7Jz7B4hLYaI4uN4gfKfIokWHwxGglH8Zqtdr4Lq9EhYTBgPQmGhGdGLTGrSw4mIeTIkQL7Xx2FwaAleQJuGlROkMpkstl7B5cnl8wrfErlUF-ABKPF9AEUAKpUfi0HjilqEKUy-qDCB-ABOYCTAEcAK64FZwNX6IxYrWgDaOOzM-UafZU0K+E6+cLWm5xBLJVJ+F7ZXK8j5u0g8LgUISBlRMZg+v08IMhsPinNLPOa9Z07yE-zG-YVpwaE60hD0nbMk5JRwPXzE9vvApfHt9gdDlijgPB0M0cPSNSBBa5lbmAs2RdeZdGkc66OJuVrXAcRI+MEPgHEaGjEi6XaXiQvb9oOdDDve46PlOr6OB+s5ftihZ-gBq7AaB252EERJ2H4GQeC4KS1uWiEXgKvwAsCXplPQZQjr6D6Ts+4pCgiSJ-Lx-FYROT7hjOGrfguCDJMa+rUcEDIlh4Th1tcIE7ASvghIcxaBKEIRsfy3ycYCIKYVJAljrJuFiYiI6OTJOEiW+BGKcRv4qUkal4kE9J4qyunbucy5JEZ1ZHLWoReFZ3Y-CGXH2SwcgAGJOUJcmiXC4kCMIeVecJ8naBic5KdqCBJIEBK7I4a5Nd4iUeNu1bxMlwWBI1DwRalyFuRhd6CdhlURpKnQ9G08qKiYibJmA6aZqY2bVeqtUBRsqRrq4jhxbW-iBBomTbudhLUuWTVMfiDgITy+AGBAcBWK6yGUOww7VBwEKlfIkj0DVRE-vtlz1vSzh4q1Docs6HZfQKHoVH9Sg1IDUIUGD+bKe4Gj6i450nsadhNRaV1bOpjFHqEqSmhWI0cRldmgv9tSQo0ePzvVDJHq4dibiBXJbAS0XBOp8MXY6nKHCz3xjaKqK83VJE3G4dhMiZ+wWkajj+F19axB4tMuPTTHHilyNIajpToxNzneeGat7XSm6+PqjVGnsFtrtTZuhRbHWM2aitXmht75VNhVuxDdLHISFP7K11Gtb4-6S7D9qy4jCu2+xNls9xDl8THLkifHykU-StElvSGixI1DjZ9LrJ506BfntZpC2aX2VlRXLv8NX9XUR4XutUxx1+IbdjdYy1KUv1g1Nw4EeCsVIqYZNleuzt4PKU8RMGtR-jUkka5gYguq9fsV9DSuoSb-3WXMFIABCpTeo7zCiBIAAsgCHgz4yhjw1iTECJBdTNx8MWA6V0BrqQpiWQ85ljongjhAwKABafY258E5ByEAA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_ONBOARDING",
      context: {},
      initial: "WAITING_INITIATIVE_SELECTION",
      states: {
        WAITING_INITIATIVE_SELECTION: {
          tags: [LOADING_TAG],
          on: {
            SELECT_INITIATIVE: {
              target: "LOADING_INITIATIVE_DATA",
              actions: "selectInitiative"
            }
          }
        },
        LOADING_INITIATIVE_DATA: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiativeData",
            id: "loadInitiativeData",
            onDone: [
              {
                target: "DISPLAYING_INITIATIVE_DATA",
                actions: "loadInitiativeDataSuccess"
              }
            ]
          },
          on: {
            "*": undefined
          }
        },
        DISPLAYING_INITIATIVE_DATA: {
          on: {
            ACCEPT_TOS: {
              target: "ACCEPTING_TOS"
            }
          }
        },
        ACCEPTING_TOS: {
          tags: [UPSERTING_TAG],
          invoke: {
            src: "acceptTos",
            id: "acceptTos",
            onDone: [
              {
                target: "LOADING_PREREQUISITES"
              }
            ]
          }
        },
        LOADING_PREREQUISITES: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadPrerequisites",
            id: "loadPrerequisites",
            onDone: [
              {
                target: "EVALUATING_PREREQUISITES",
                actions: "loadPrerequisitesSuccess"
              }
            ]
          }
        },
        EVALUATING_PREREQUISITES: {
          tags: [LOADING_TAG],
          always: [
            {
              target: "DISPLAYING_PDND_PREREQUISITES",
              cond: "hasPDNDPrerequisites"
            },
            {
              target: "DISPLAYING_SELF_PREREQUISITES",
              cond: "hasSelfPrerequisites"
            },
            {
              target: "DISPLAYING_ONBOARDING_COMPLETED"
            }
          ]
        },
        DISPLAYING_PDND_PREREQUISITES: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            ACCEPT_PDND_PREREQUISITES: [
              {
                target: "DISPLAYING_SELF_PREREQUISITES",
                cond: "hasSelfPrerequisites"
              },
              {
                target: "ACCEPTING_PREREQUISITES"
              }
            ]
          }
        },
        DISPLAYING_SELF_PREREQUISITES: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            ACCEPT_SELF_PREREQUISITES: {
              target: "ACCEPTING_PREREQUISITES"
            }
          }
        },
        ACCEPTING_PREREQUISITES: {
          tags: [UPSERTING_TAG],
          invoke: {
            src: "acceptPrerequisites",
            id: "acceptPrerequisites",
            onDone: [
              {
                target: "DISPLAYING_ONBOARDING_COMPLETED"
              }
            ]
          }
        },
        DISPLAYING_ONBOARDING_COMPLETED: {
          type: "final"
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({ serviceId: event.serviceId }))
      }
    }
  );

type OnboardingMachineType = ReturnType<typeof createIDPayOnboardingMachine>;

export type { OnboardingMachineType };
export { createIDPayOnboardingMachine };
