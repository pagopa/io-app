import * as O from "fp-ts/lib/Option";
import {
  canShowMorePaymentsLink,
  extractPNOptInMessageInfoIfAvailable,
  maxVisiblePaymentCount,
  notificationStatusToTimelineStatus,
  openingSourceIsAarMessage,
  paymentsFromSendMessage,
  shouldUseBottomSheetForPayments
} from "..";
import { GlobalState } from "../../../../store/reducers/types";
import { CTAS } from "../../../../types/LocalizedCTAs";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { PNMessage } from "../../store/types/types";
import { SendOpeningSource } from "../../../pushNotifications/analytics";

const navigateToServiceLink = () =>
  "ioit://services/service-detail?serviceId=optInServiceId&activate=true";

const getMockPnOptInServiceId = () => "optInServiceId" as ServiceId;

const getMockState = () =>
  ({
    remoteConfig: O.some({
      pn: {
        optInServiceId: getMockPnOptInServiceId()
      }
    })
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
    cta1LinksToPNService: boolean;
    cta2LinksToPNService: boolean;
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
      cta1LinksToPNService: true,
      cta2LinksToPNService: true
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
      cta1LinksToPNService: true,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: true,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: true
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
        remoteConfig: O.some({
          pn: {
            optInServiceId: "notTheOptInServiceId"
          }
        })
      } as GlobalState
    },
    output: {
      isPNOptInMessage: false,
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
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
        remoteConfig: O.none
      } as GlobalState
    },
    output: {
      isPNOptInMessage: false,
      cta1LinksToPNService: false,
      cta2LinksToPNService: false
    }
  }
];

const sendOpeningSources: ReadonlyArray<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];

describe("maxVisiblePaymentCount", () => {
  it("should return 5", () => {
    expect(maxVisiblePaymentCount).toBe(5);
  });
});

describe("extractPNOptInMessageInfoIfAvailable", () => {
  isPNOptInMessageTestInput.forEach(testData => {
    it(testData.testDescription, () => {
      const isPNOptInMessageInfo = extractPNOptInMessageInfoIfAvailable(
        testData.input.CTAs,
        testData.input.serviceId,
        testData.input.state
      );
      expect(isPNOptInMessageInfo).toEqual(testData.output);
    });
  });
});

describe("canShowMorePaymentsLink", () => {
  it("should return false (hide), cancelled message, undefined payments", () => {
    const showMorePayments = canShowMorePaymentsLink(true, undefined);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), cancelled message, empty payments", () => {
    const showMorePayments = canShowMorePaymentsLink(true, []);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), cancelled message, less than five (max-visible) payments", () => {
    const payments = [...Array(4).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), cancelled message, five (max-visible) payments", () => {
    const payments = [...Array(5).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), cancelled message, more than five (max-visible) payments", () => {
    const payments = [...Array(6).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), not cancelled message, undefined payments", () => {
    const showMorePayments = canShowMorePaymentsLink(false, undefined);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), not cancelled message, empty payments", () => {
    const showMorePayments = canShowMorePaymentsLink(false, []);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), not cancelled message, less than five (max-visible) payments", () => {
    const payments = [...Array(4).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(false, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false (hide), not cancelled message, five (max-visible) payments", () => {
    const payments = [...Array(5).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(false, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return true (visible), not cancelled message, more than five (max-visible) payments", () => {
    const payments = [...Array(6).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = canShowMorePaymentsLink(false, payments);
    expect(showMorePayments).toBe(true);
  });
});

describe("notificationStatusToTimelineStatus", () => {
  it("should return 'viewed' for 'VIEWED'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("VIEWED");
    expect(timelineStatus).toBe("viewed");
  });
  it("should return 'effective' for 'EFFECTIVE_DATE'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("EFFECTIVE_DATE");
    expect(timelineStatus).toBe("effective");
  });
  it("should return 'unreachable' for 'UNREACHABLE'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("UNREACHABLE");
    expect(timelineStatus).toBe("unreachable");
  });
  it("should return 'cancelled' for 'CANCELLED'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("CANCELLED");
    expect(timelineStatus).toBe("cancelled");
  });
  it("should return 'default' for 'IN_VALIDATION'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("IN_VALIDATION");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for 'ACCEPTED'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("ACCEPTED");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for 'REFUSED'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("REFUSED");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for 'DELIVERING'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("DELIVERING");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for 'DELIVERED'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("DELIVERED");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for 'PAID'", () => {
    const timelineStatus = notificationStatusToTimelineStatus("PAID");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for empty string", () => {
    const timelineStatus = notificationStatusToTimelineStatus("");
    expect(timelineStatus).toBe("default");
  });
  it("should return 'default' for unmapped string", () => {
    const timelineStatus = notificationStatusToTimelineStatus("whatever");
    expect(timelineStatus).toBe("default");
  });
});

describe("shouldUseBottomSheetForPayments", () => {
  it("should return false, cancelled message, undefined payments", () => {
    const showMorePayments = shouldUseBottomSheetForPayments(true, undefined);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, cancelled message, empty payments", () => {
    const showMorePayments = shouldUseBottomSheetForPayments(true, []);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, cancelled message, one payment", () => {
    const payments = [...Array(1).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, cancelled message, two payments", () => {
    const payments = [...Array(2).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, cancelled message, more than two payments", () => {
    const payments = [...Array(3).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(true, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, not cancelled message, undefined payments", () => {
    const showMorePayments = shouldUseBottomSheetForPayments(false, undefined);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, not cancelled message, empty payments", () => {
    const showMorePayments = shouldUseBottomSheetForPayments(false, []);
    expect(showMorePayments).toBe(false);
  });
  it("should return false, not cancelled message, one payment", () => {
    const payments = [...Array(1).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(false, payments);
    expect(showMorePayments).toBe(false);
  });
  it("should return true, not cancelled message, two payments", () => {
    const payments = [...Array(2).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(false, payments);
    expect(showMorePayments).toBe(true);
  });
  it("should return true, not cancelled message, more than two payments", () => {
    const payments = [...Array(3).keys()].map(
      _ => ({} as NotificationPaymentInfo)
    );
    const showMorePayments = shouldUseBottomSheetForPayments(false, payments);
    expect(showMorePayments).toBe(true);
  });
});

describe("paymentsFromSendMessage", () => {
  const userFiscalCode = "RSSMRA80A10H501A";

  it(`should return undefined when the message is undefined`, () => {
    const output = paymentsFromSendMessage(userFiscalCode, undefined);
    expect(output).toBe(undefined);
  });
  const noPaymentRecipients = {
    recipients: [{}, {}, {}]
  } as unknown as PNMessage;
  it(`should return undefined when message has empty recipients`, () => {
    const output = paymentsFromSendMessage(userFiscalCode, noPaymentRecipients);
    expect(output).toBe(undefined);
  });
  const recipientsWithTaxId = {
    recipients: [
      {
        payment: {
          creditorTaxId: "c1",
          noticeCode: "n1"
        },
        taxId: userFiscalCode
      },
      {
        payment: {
          creditorTaxId: "c2",
          noticeCode: "n2"
        },
        taxId: "NotMatchingTaxId"
      },
      {
        taxId: userFiscalCode
      },
      {
        taxId: "NotMatchingTaxId"
      }
    ]
  } as unknown as PNMessage;
  it(`should return one matching payments when the message is defined and the input fiscal code is undefined`, () => {
    const output = paymentsFromSendMessage(userFiscalCode, recipientsWithTaxId);
    expect(output).toEqual([
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      }
    ]);
  });
  it(`should return two matching payments when the message pot is defined and the input fiscal code is undefined`, () => {
    const output = paymentsFromSendMessage(undefined, recipientsWithTaxId);
    expect(output).toEqual([
      {
        creditorTaxId: "c1",
        noticeCode: "n1"
      },
      {
        creditorTaxId: "c2",
        noticeCode: "n2"
      }
    ]);
  });
});

describe("openingSourceIsAarMessage", () => {
  sendOpeningSources.forEach(sendOpeningSource => {
    const isAar = sendOpeningSource === "aar";
    it(`should output '${isAar}' when opening source is '${sendOpeningSource}'`, () => {
      const output = openingSourceIsAarMessage(sendOpeningSource);
      expect(output).toBe(isAar);
    });
  });
});
