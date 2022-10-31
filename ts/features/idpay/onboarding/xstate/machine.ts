import { assign, createMachine } from "xstate";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../utils/xstate";

// Context types
type Context = {
  serviceId?: string;
  initative?: InitiativeDto;
  requiredCriteria?: RequiredCriteriaDTO;
};

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type E_ACCEPT_REQUIRED_PDND_CRITERIA = {
  type: "ACCEPT_REQUIRED_PDND_CRITERIA";
};

type E_ACCEPT_REQUIRED_SELF_CRITERIA = {
  type: "ACCEPT_REQUIRED_SELF_CRITERIA";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_ACCEPT_TOS
  | E_ACCEPT_REQUIRED_PDND_CRITERIA
  | E_ACCEPT_REQUIRED_SELF_CRITERIA;

// Services types
type Services = {
  loadInitiative: {
    data: InitiativeDto;
  };
  acceptTos: {
    data: undefined;
  };
  loadRequiredCriteria: {
    data: RequiredCriteriaDTO;
  };
  acceptRequiredCriteria: {
    data: undefined;
  };
};

const hasRequiredCriteriaType = <T>(a: ReadonlyArray<T> | undefined) =>
  a !== undefined && a.length > 0;

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
              target: "LOADING_INITIATIVE",
              actions: "selectInitiative"
            }
          }
        },
        LOADING_INITIATIVE: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiative",
            id: "loadInitiative",
            onDone: [
              {
                target: "DISPLAYING_INITIATIVE",
                actions: "loadInitiativeSuccess"
              }
            ]
          }
        },
        DISPLAYING_INITIATIVE: {
          on: {
            ACCEPT_TOS: {
              target: "ACCEPTING_TOS"
            }
          }
        },
        ACCEPTING_TOS: {
          tags: [UPSERTING_TAG],
          invoke: {
            id: "acceptTos",
            src: "acceptTos",
            onDone: [
              {
                target: "LOADING_REQUIRED_CRITERIA"
              }
            ]
          }
        },
        LOADING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          invoke: {
            id: "loadRequiredCriteria",
            src: "loadRequiredCriteria",
            onDone: [
              {
                target: "EVALUATING_REQUIRED_CRITERIA",
                actions: "loadRequiredCriteriaSuccess"
              }
            ]
          }
        },
        // Self transition node to evaluate required criteria
        EVALUATING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          always: [
            {
              target: "DISPLAYING_REQUIRED_PDND_CRITERIA",
              cond: "hasPDNDRequiredCriteria"
            },
            {
              target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
              cond: "hasSelfRequiredCriteria"
            },
            {
              target: "DISPLAYING_ONBOARDING_COMPLETED"
            }
          ]
        },
        DISPLAYING_REQUIRED_PDND_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            ACCEPT_REQUIRED_PDND_CRITERIA: [
              {
                target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
                cond: "hasSelfRequiredCriteria"
              },
              {
                target: "ACCEPTING_REQUIRED_CRITERIA"
              }
            ]
          }
        },
        DISPLAYING_REQUIRED_SELF_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            ACCEPT_REQUIRED_SELF_CRITERIA: {
              target: "ACCEPTING_REQUIRED_CRITERIA"
            }
          }
        },
        ACCEPTING_REQUIRED_CRITERIA: {
          tags: [UPSERTING_TAG],
          invoke: {
            src: "acceptRequiredCriteria",
            id: "acceptRequiredCriteria",
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
        selectInitiative: assign((_, event) => ({
          serviceId: event.serviceId
        })),
        loadInitiativeSuccess: assign((_, event) => ({
          initative: event.data
        })),
        loadRequiredCriteriaSuccess: assign((_, event) => ({
          requiredCriteria: event.data
        }))
      },
      guards: {
        hasPDNDRequiredCriteria: (context: Context) =>
          hasRequiredCriteriaType(context.requiredCriteria?.pdndCriteria),
        hasSelfRequiredCriteria: (context: Context) =>
          hasRequiredCriteriaType(context.requiredCriteria?.selfDeclarationList)
      }
    }
  );

type IDPayOnboardingMachineType = ReturnType<typeof createIDPayOnboardingMachine>;

export type { IDPayOnboardingMachineType };
export { hasRequiredCriteriaType as isDefinedUnemptyArray, createIDPayOnboardingMachine };
