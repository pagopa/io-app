import * as O from "fp-ts/lib/Option";
import { assign, createMachine } from "xstate";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { LOADING_TAG, UPSERTING_TAG } from "../../../../utils/xstate";

// Context types
export type Context = {
  serviceId?: string;
  initiative?: InitiativeDto;
  requiredCriteria?: O.Option<RequiredCriteriaDTO>;
};

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type Events = E_SELECT_INITIATIVE | E_ACCEPT_TOS;

// Services types
type Services = {
  loadInitiative: {
    data: InitiativeDto;
  };
  acceptTos: {
    data: undefined;
  };
  loadRequiredCriteria: {
    data: O.Option<RequiredCriteriaDTO>;
  };
};

const createIDPayOnboardingMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoHkA5AIX0wCVVlCBxAOgHVNkAVam3a15TNgNQCiuAMoCAMgIDCbIgGJRE6Z0LdeyQQG0ADAF1EoAA4B7WAEsALqaMA7fSACeiAEwAWLQBoQAD2cB2AMx0vgCs-v6+TgCMAJxO-gAcTvEAvsmeaFh4RKQUVLR0YmR5HFxsaoKyEDZgdKbWAG5GANY1ADZGAIYQyNYWph2W9WDaekggxmaWNnaOCP7B8UGR8aFaAGzBLtFaEZ4+CE6+i+Errkdah-4uLqlpINZGEHB2GTgEJGSU7IzMbLTKqn4QgUUhkhDsEz60zG+w8DmcblS6Qwb2yn2KBSK7ABZSBEJMUNsMMQcNm80WvmWqw2Wx2TiRIFeWQ+uW+VGE6DEOGxpR4eLGkKmRNAsM8s2CWhcdHivjW0Uia3iK3CawZTPeOS+tHxkyswu8iAAtC54mLEJFgpE6Fp-GsXKEzjsbbdkkA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_ONBOARDING",
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
          type: "final",
          tags: [LOADING_TAG]
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({
          serviceId: event.serviceId
        })),
        loadInitiativeSuccess: assign((_, event) => ({
          initiative: event.data
        })),
        loadRequiredCriteriaSuccess: assign((_, event) => ({
          requiredCriteria: event.data
        }))
      }
    }
  );

type IDPayOnboardingMachineType = ReturnType<
  typeof createIDPayOnboardingMachine
>;

export type { IDPayOnboardingMachineType };
export { createIDPayOnboardingMachine };
