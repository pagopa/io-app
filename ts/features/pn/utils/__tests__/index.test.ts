import * as O from "fp-ts/lib/Option";
import { isPNOptInMessage } from "..";
import { GlobalState } from "../../../../store/reducers/types";
import { CTAS } from "../../../messages/types/MessageCTA";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

const navigateToServiceLink = () =>
  "ioit://services/service-detail?serviceId=optInServiceId&activate=true";

const getMockPnOptInServiceId = () => "optInServiceId" as ServiceId;

const getMockState = () =>
  ({
    backendStatus: {
      status: O.some({
        config: {
          pn: {
            optInServiceId: getMockPnOptInServiceId()
          }
        }
      })
    }
  } as GlobalState);

const getMockCTAs = () =>
  ({
    cta_1: {
      text: "Attiva il servizio",
      action: navigateToServiceLink()
    },
    cta_2: {
      text: "Attiva il servizio",
      action: navigateToServiceLink()
    }
  } as CTAS);

type IsPNOptInMessageTestInputType = {
  testDescription: string;
  input: {
    CTAs: CTAS | undefined;
    serviceId: ServiceId | undefined;
    state: GlobalState;
  };
  output: {
    isPNOptInMessage: boolean;
    cta1HasServiceNavigationLink: boolean;
    cta2HasServiceNavigationLink: boolean;
  };
};

const isPNOptInMessageTestInput: Array<IsPNOptInMessageTestInputType> = [
  {
    testDescription: "should detect the OptIn format and both CTAs",
    input: {
      CTAs: getMockCTAs(),
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: true,
      cta1HasServiceNavigationLink: true,
      cta2HasServiceNavigationLink: true
    }
  },
  {
    testDescription:
      "should detect the OptIn format, the first CTA but not the second (when its input is undefined)",
    input: {
      CTAs: {
        ...getMockCTAs(),
        cta_2: undefined
      },
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: true,
      cta1HasServiceNavigationLink: true,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should detect the OptIn format, the first CTA but not the second (when its action does not contain a service navigation link)",
    input: {
      CTAs: {
        ...getMockCTAs(),
        cta_2: {
          text: "Attiva il servizio",
          action: "ioit://main/messages"
        }
      },
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: true,
      cta1HasServiceNavigationLink: true,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should detect the OptIn format, the second CTA but not the fist (when its action does not contain a service navigation link)",
    input: {
      CTAs: {
        ...getMockCTAs(),
        cta_1: {
          text: "Attiva il servizio",
          action: "ioit://main/messages"
        }
      },
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: true,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: true
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when the first CTA does not contain a service navigation link and the second is undefined",
    input: {
      CTAs: {
        cta_1: {
          text: "Attiva il servizio",
          action: "ioit://main/messages"
        }
      },
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when both CTAs do not contain a service navigation link",
    input: {
      CTAs: {
        cta_1: {
          text: "Attiva il servizio",
          action: "ioit://main/messages"
        },
        cta_2: {
          text: "Attiva il servizio",
          action: "ioit://main/services"
        }
      },
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when CTAs are not defined",
    input: {
      CTAs: undefined,
      serviceId: getMockPnOptInServiceId(),
      state: getMockState()
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when the service's id is not the OptIn one",
    input: {
      CTAs: getMockCTAs(),
      serviceId: "NotTheOptInOne" as ServiceId,
      state: getMockState()
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when the service is undefined",
    input: {
      CTAs: getMockCTAs(),
      serviceId: undefined,
      state: getMockState()
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when state.backendStatus.status.config.pn.optInServiceId does not match service.id",
    input: {
      CTAs: getMockCTAs(),
      serviceId: getMockPnOptInServiceId(),
      state: {
        ...getMockState(),
        backendStatus: {
          status: O.some({
            config: {
              pn: {
                optInServiceId: "notTheOptInServiceId"
              }
            }
          })
        }
      } as GlobalState
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  },
  {
    testDescription:
      "should not recognize the OptIn format, when state.backendStatus.status is O.none",
    input: {
      CTAs: getMockCTAs(),
      serviceId: getMockPnOptInServiceId(),
      state: {
        ...getMockState(),
        backendStatus: {
          status: O.none
        }
      } as GlobalState
    },
    output: {
      isPNOptInMessage: false,
      cta1HasServiceNavigationLink: false,
      cta2HasServiceNavigationLink: false
    }
  }
];

describe("isPNOptInMessage", () => {
  isPNOptInMessageTestInput.forEach(testData => {
    it(testData.testDescription, () => {
      const isPNOptInMessageInfo = isPNOptInMessage(
        testData.input.CTAs,
        testData.input.serviceId,
        testData.input.state
      );
      expect(isPNOptInMessageInfo).toEqual(testData.output);
    });
  });
});
