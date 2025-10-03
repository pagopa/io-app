import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage as PnThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { EphemeralAarMessageDataActionPayload } from "../store/actions";
import { fillerEphemeralAARMarkdown } from "./detailsById";
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
    fullNameDestinatario: "Mario Rossi"
  }),
  displayingNotificationData: () => ({
    type: "displayingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    notification: {}
  }),
  notAddresseeFinal: () => ({
    type: "notAddresseeFinal",
    fullNameDestinatario: "Mario Rossi",
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  ko: () => ({
    type: "ko",
    previousState: { type: "none" }
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
    markDown: fillerEphemeralAARMarkdown,
    subject: "subject" as MessageSubject,
    mandateId: "MANDATE123"
  };
