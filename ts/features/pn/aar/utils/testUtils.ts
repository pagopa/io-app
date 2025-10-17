import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { EphemeralAarMessageDataActionPayload } from "../store/actions";
import { AARFlowState, sendAARFlowStates } from "./stateUtils";

export const sendAarMockStateFactory: Record<
  AARFlowState["type"],
  () => AARFlowState
> = {
  none: () => ({ type: "none" }),
  displayingAARToS: () => ({
    type: "displayingAARToS",
    qrCode: "https://www.google.com"
  }),
  fetchingQRData: () => ({
    type: "fetchingQRData",
    qrCode: "https://www.google.com"
  }),
  fetchingNotificationData: () => ({
    type: "fetchingNotificationData",
    iun: "000000000001",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    }
  }),
  displayingNotificationData: () => ({
    type: "displayingNotificationData",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    notification: {},
    iun: "000000000001",
    pnServiceId: "SERVICEID123" as NonEmptyString,
    mandateId: "MANDATE123"
  }),
  notAddresseeFinal: () => ({
    type: "notAddresseeFinal",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  ko: () => ({
    type: "ko",
    previousState: { type: "none" },
    debugData: {
      phase: "Entry Point",
      reason: "Sample reason"
    }
  })
};

export const sendAarStateNames = Object.values(sendAARFlowStates);
export const sendAarMockStates = sendAarStateNames.map(t =>
  sendAarMockStateFactory[t]()
);
export const mockEphemeralAarMessageDataActionPayload: EphemeralAarMessageDataActionPayload =
  {
    iun: "IUN123" as NonEmptyString,
    thirdPartyMessage: { foo: "bar" } as PnThirdPartyMessage,
    fiscalCode: "TAXCODE123" as FiscalCode,
    pnServiceID: "SERVICEID123" as NonEmptyString,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: "subject" as MessageSubject,
    mandateId: "MANDATE123"
  };
