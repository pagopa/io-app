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
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoHkA5AIX0wCVVlCBxAOgHVNkAVam3a15TNgNQCiuAMoCAMgIDCbIgGJRE6Z0LdeyQQG0ADAF1EoAA4B7WAEsALqaMA7fSACeiAEwAWLQBoQAD2cB2AMx0vgCs-v6+TgCMAJxO-gAcTvEAvsmeaFh4RKQUVLR0YmR5HFxsaoKyEDZgdKbWAG5GANY1ADZGAIYQyNYWph2W9WDaekggxmaWNnaOCP7B8UGR8aFaAGzBLtFaEZ4+CE6+i+Errkdah-4uLqnpGDgEJGSU7HRUwuhiOOzKqvwCskwkkkAnQLFwLHwwhGdgmfWmY32kSOdC0LiOLic22iwV8WminlmuN8dEiLmROM2WmC0RCtxAGQe2WexToQJBYJ+kOElWqtQazRqHQAxsKwAZzCwTDCxnCprZEYgwotljF4kdIsFlmjCYg8cdMS55gtIpEtP5IvTGVknrlXoVMMVcOQBABFACqyBdqFwknIrAE-swvOsNTqjRadHaXXIYAAjgBXUwAJ0gkmTFjAGY6MsMJnhCtAs3VWjoawCvhcazN2y08Xie0QLmCTjoLfi0X86zWbjWTmCqTSIGsRggcDs1seORe+SY3FovzK-xE4ikMkIsPz8rs+w8Dmcbit9xt09ZDqdpR4-03kyshe8iD3s3mi18y1WGy2OycR8yU5ZrzvJ83wLpe5QCDeBY7o+uoIMEaJ0OqazRJEaz1qEvhrL+TK2jO9DsqCbALtykHboqCBPogyFrIhmEoWhKzhFhQ6Tsydr5OePwuh6XoCD6foBkGpF3tBFGwSWZYVlWNZaHWKQsce-7sfQAh8JgYjumoC7cZ63q+v6LCBjwwkIqAu6wWaayBOaVYrJEVz1r4vjYSeAG0CZ977AAtC4Db7ggmqRKiUTqniWj2aEcSDskQA */
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
      on: {
        SELECT_INITIATIVE: {
          target: "LOADING_INITIATIVE",
          actions: "selectInitiative"
        }
      }
    },
    LOADING_INITIATIVE: {
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
      invoke: {
        src: "acceptTos",
        id: "acceptTos",
        onDone: [
          {
            target: "LOADING_REQUIRED_CRITERIA"
          }
        ]
      }
    },
    LOADING_REQUIRED_CRITERIA: {
      invoke: {
        src: "loadRequiredCriteria",
        id: "loadRequiredCriteria",
        onDone: [
          {
            target: "EVALUATING_REQUIRED_CRITERIA",
            actions: "loadRequiredCriteriaSuccess"
          }
        ]
      }
    },
    EVALUATING_REQUIRED_CRITERIA: {
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
