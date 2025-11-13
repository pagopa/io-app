import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { EphemeralAarMessageDataActionPayload } from "../store/actions";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import { AARFlowState, RecipientInfo, sendAARFlowStates } from "./stateUtils";

const iun = "000000000001";
const recipientInfo: RecipientInfo = {
  denomination: "Mario Rossi",
  taxId: "RSSMRA74D22A001Q"
};
const qrCode = "https://www.google.com";
const pnServiceId = "SERVICEID123" as NonEmptyString;
const mandateId = "MANDATE123";
const validationCode = "validation_code";
const can = "123456";

export const sendAarMockStateFactory: {
  [K in AARFlowState["type"]]: () => Extract<AARFlowState, { type: K }>;
} = {
  none: () => ({ type: "none" }),
  displayingAARToS: () => ({
    type: "displayingAARToS",
    qrCode
  }),
  fetchingQRData: () => ({
    type: "fetchingQRData",
    qrCode
  }),
  fetchingNotificationData: () => ({
    type: "fetchingNotificationData",
    iun,
    recipientInfo
  }),
  displayingNotificationData: () => ({
    type: "displayingNotificationData",
    recipientInfo,
    notification: {},
    iun,
    pnServiceId,
    mandateId
  }),
  notAddresseeFinal: () => ({
    type: "notAddresseeFinal",
    recipientInfo,
    qrCode,
    iun
  }),
  notAddressee: () => ({
    type: "notAddressee",
    recipientInfo,
    qrCode,
    iun
  }),
  creatingMandate: () => ({
    type: "creatingMandate",
    recipientInfo,
    qrCode,
    iun
  }),
  cieCanAdvisory: () => ({
    type: "cieCanAdvisory",
    recipientInfo,
    iun,
    mandateId,
    timeToLive: "",
    validationCode
  }),
  cieCanInsertion: () => ({
    type: "cieCanInsertion",
    recipientInfo,
    iun,
    mandateId,
    timeToLive: "",
    validationCode
  }),
  cieScanningAdvisory: () => ({
    type: "cieScanningAdvisory",
    recipientInfo,
    iun,
    mandateId,
    timeToLive: "",
    validationCode,
    can
  }),
  androidNFCActivation: () => ({
    type: "androidNFCActivation",
    recipientInfo,
    iun,
    mandateId,
    timeToLive: "",
    validationCode,
    can
  }),
  cieScanning: () => ({
    type: "cieScanning",
    recipientInfo,
    iun,
    mandateId,
    timeToLive: "",
    validationCode,
    can
  }),
  validatingMandate: () => ({
    type: "validatingMandate",
    recipientInfo,
    iun,
    mandateId,
    signedVerificationCode: "signed_validation_code",
    mrtdData: {
      dg1: "",
      dg11: "",
      sod: ""
    },
    nisData: {
      nis: "",
      publicKey: "",
      signedChallenge: "",
      sod: ""
    }
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
    thirdPartyMessage: {} as unknown as ThirdPartyMessage,
    fiscalCode: "TAXCODE123" as FiscalCode,
    pnServiceID: pnServiceId,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: "subject" as MessageSubject,
    mandateId: "MANDATE123"
  };
