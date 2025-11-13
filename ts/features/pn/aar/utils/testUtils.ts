import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { EphemeralAarMessageDataActionPayload } from "../store/actions";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import { AARFlowState, sendAARFlowStates } from "./stateUtils";

export const sendAarMockStateFactory: {
  [K in AARFlowState["type"]]: () => Extract<AARFlowState, { type: K }>;
} = {
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
  notAddressee: () => ({
    type: "notAddressee",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  creatingMandate: () => ({
    type: "creatingMandate",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    qrCode: "https://www.google.com",
    iun: "000000000001"
  }),
  cieCanAdvisory: () => ({
    type: "cieCanAdvisory",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
    timeToLive: "",
    validationCode: "validation_code"
  }),
  cieCanInsertion: () => ({
    type: "cieCanInsertion",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
    timeToLive: "",
    validationCode: "validation_code"
  }),
  cieScanningAdvisory: () => ({
    type: "cieScanningAdvisory",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
    timeToLive: "",
    validationCode: "validation_code",
    can: "123456"
  }),
  androidNFCActivation: () => ({
    type: "androidNFCActivation",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
    timeToLive: "",
    validationCode: "validation_code",
    can: "123456"
  }),
  cieScanning: () => ({
    type: "cieScanning",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
    timeToLive: "",
    validationCode: "validation_code",
    can: "123456"
  }),
  validatingMandate: () => ({
    type: "validatingMandate",
    recipientInfo: {
      denomination: "Mario Rossi",
      taxId: "RSSMRA74D22A001Q"
    },
    iun: "000000000001",
    mandateId: "test_id",
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
    pnServiceID: "SERVICEID123" as NonEmptyString,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: "subject" as MessageSubject,
    mandateId: "MANDATE123"
  };
