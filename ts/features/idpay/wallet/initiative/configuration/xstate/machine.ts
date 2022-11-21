import { createMachine } from "xstate";
import {
  LOADING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../../../utils/xstate";

type Context = {
  initiativeId?: string;
};

type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
};

type Events = E_SELECT_INITIATIVE;

type Services = {};

const createIDPayInitiativeConfigurationMachine = () =>
  createMachine({
    predictableActionArguments: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as Events,
      services: {} as Services
    },
    id: "IDPAY_INITIATIVE_CONFIGURATION",
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
              target: "EVALUTING_INITIATIVE_CONFIGURATION",
              actions: "loadInitiativeSuccess"
            }
          ]
        }
      },
      EVALUTING_INITIATIVE_CONFIGURATION: {
        tags: [LOADING_TAG],
        always: [
          {
            cond: "isInitiativeConfigurationNeeded",
            target: "CONFIGURING_INITIATIVE"
          },
          {
            target: "CONFIGURATION_NOT_NEEDED"
          }
        ]
      },
      CONFIGURING_INITIATIVE: {
        tags: [WAITING_USER_INPUT_TAG],
        type: "final"
      },
      CONFIGURATION_NOT_NEEDED: {
        type: "final"
      }
    }
  });

export { createIDPayInitiativeConfigurationMachine };
