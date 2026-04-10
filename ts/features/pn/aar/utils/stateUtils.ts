import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";

export type SendAarFlowStatesType = typeof sendAarFlowStates;
export type SendAarFailurePhase =
  | "Download Attachment"
  | "Entry Point"
  | "Fetch Notification"
  | "Fetch QRCode"
  | "Validate Mandate"
  | "Playground"
  | "Show Notification"
  | "Create Mandate";

export type RecipientInfo = {
  denomination: string;
  taxId: string;
};

type MrtdData = {
  sod: string;
  dg1: string;
  dg11: string;
};

type NisData = {
  sod: string;
  nis: string;
  publicKey: string;
};

type NotInitialized = {
  type: SendAarFlowStatesType["none"];
};

type DisplayingTos = {
  type: SendAarFlowStatesType["displayingAarToS"];
  qrCode: string;
};

type FetchQR = {
  type: SendAarFlowStatesType["fetchingQRData"];
  qrCode: string;
};

type FetchNotification = {
  type: SendAarFlowStatesType["fetchingNotificationData"];
  iun: string;
  recipientInfo: RecipientInfo;
  mandateId?: string;
};

type DisplayingNotification = {
  type: SendAarFlowStatesType["displayingNotificationData"];
  recipientInfo: RecipientInfo;
  notification: ThirdPartyMessage;
  iun: string;
  pnServiceId: ServiceId;
  mandateId?: string;
};

type FinalNotAddressee = {
  type: SendAarFlowStatesType["notAddresseeFinal"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type NotAddressee = {
  type: SendAarFlowStatesType["notAddressee"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};
type NfcNotSupportedFinal = {
  type: SendAarFlowStatesType["nfcNotSupportedFinal"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type CreateMandate = {
  type: SendAarFlowStatesType["creatingMandate"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type CieCanAdvisory = {
  type: SendAarFlowStatesType["cieCanAdvisory"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
};

type CieCanInsertion = {
  type: SendAarFlowStatesType["cieCanInsertion"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
};

type CieScanningAdvisory = {
  type: SendAarFlowStatesType["cieScanningAdvisory"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type AndroidNFCActivation = {
  type: SendAarFlowStatesType["androidNFCActivation"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type CieScanning = {
  type: SendAarFlowStatesType["cieScanning"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type ValidatingMandate = {
  type: SendAarFlowStatesType["validatingMandate"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  mrtdData: MrtdData;
  nisData: NisData;
  unsignedVerificationCode: string;
  signedVerificationCode: string;
};

type ErrorState = {
  type: SendAarFlowStatesType["ko"];
  previousState: AarFlowState;
  error?: AARProblemJson;
  debugData: {
    phase: SendAarFailurePhase;
    reason: string;
  };
};

export type AarFlowStateName =
  SendAarFlowStatesType[keyof SendAarFlowStatesType];

const sendAarFlowDefaultStates = {
  none: "none",
  displayingAarToS: "displayingAarToS",
  fetchingQRData: "fetchingQRData",
  fetchingNotificationData: "fetchingNotificationData",
  displayingNotificationData: "displayingNotificationData"
} as const;

const sendAarFlowDelegatedStates = {
  notAddressee: "notAddressee",
  creatingMandate: "creatingMandate",
  cieCanAdvisory: "cieCanAdvisory",
  cieCanInsertion: "cieCanInsertion",
  cieScanningAdvisory: "cieScanningAdvisory",
  androidNFCActivation: "androidNFCActivation",
  validatingMandate: "validatingMandate",
  cieScanning: "cieScanning"
} as const;

const sendAarFailureStates = {
  notAddresseeFinal: "notAddresseeFinal",
  nfcNotSupportedFinal: "nfcNotSupportedFinal",
  ko: "ko"
} as const;

export const sendAarFlowStates = {
  ...sendAarFlowDefaultStates,
  ...sendAarFlowDelegatedStates,
  ...sendAarFailureStates
} as const;

export const validAarStatusTransitions = new Map<
  AarFlowState["type"],
  Set<AarFlowState["type"]>
>([
  [sendAarFlowStates.none, new Set([sendAarFlowStates.displayingAarToS])],
  [
    sendAarFlowStates.displayingAarToS,
    new Set([sendAarFlowStates.fetchingQRData])
  ],
  [
    sendAarFlowStates.fetchingQRData,
    new Set([
      sendAarFlowStates.fetchingNotificationData,
      sendAarFlowStates.notAddresseeFinal,
      sendAarFlowStates.notAddressee,
      sendAarFlowStates.ko
    ])
  ],
  [
    sendAarFlowStates.fetchingNotificationData,
    new Set([
      sendAarFlowStates.displayingNotificationData,
      sendAarFlowStates.ko
    ])
  ],
  [sendAarFlowStates.displayingNotificationData, new Set([])],
  [sendAarFlowStates.notAddresseeFinal, new Set([])],
  [
    sendAarFlowStates.ko,
    new Set([
      sendAarFlowStates.fetchingQRData,
      sendAarFlowStates.fetchingNotificationData,
      sendAarFlowStates.cieCanAdvisory
    ])
  ],
  [
    sendAarFlowStates.notAddressee,
    new Set([
      sendAarFlowStates.creatingMandate,
      sendAarFlowStates.nfcNotSupportedFinal
    ])
  ],
  [
    sendAarFlowStates.creatingMandate,
    new Set([sendAarFlowStates.cieCanAdvisory, sendAarFlowStates.ko])
  ],
  [
    sendAarFlowStates.cieCanAdvisory,
    new Set([sendAarFlowStates.cieCanInsertion])
  ],
  [
    sendAarFlowStates.cieCanInsertion,
    new Set([
      sendAarFlowStates.cieCanAdvisory,
      sendAarFlowStates.cieScanningAdvisory
    ])
  ],
  [
    sendAarFlowStates.cieScanningAdvisory,
    new Set([
      sendAarFlowStates.cieCanInsertion,
      sendAarFlowStates.androidNFCActivation,
      sendAarFlowStates.cieScanning
    ])
  ],
  [
    sendAarFlowStates.androidNFCActivation,
    new Set([sendAarFlowStates.cieScanning])
  ],
  [
    sendAarFlowStates.cieScanning,
    new Set([
      sendAarFlowStates.cieScanningAdvisory,
      sendAarFlowStates.cieCanAdvisory,
      sendAarFlowStates.validatingMandate
    ])
  ],
  [
    sendAarFlowStates.validatingMandate,
    new Set([sendAarFlowStates.ko, sendAarFlowStates.fetchingNotificationData])
  ]
]);

export const isValidAarStateTransition = (
  currentType: AarFlowStateName,
  nextType: AarFlowStateName
): boolean => {
  const allowedNextStates = validAarStatusTransitions.get(currentType);
  return allowedNextStates?.has(nextType) ?? false;
};

export const maybeIunFromAarFlowState = (
  data: AarFlowState
): string | undefined => {
  switch (data.type) {
    case sendAarFlowStates.notAddresseeFinal:
    case sendAarFlowStates.fetchingNotificationData:
    case sendAarFlowStates.displayingNotificationData:
      return data.iun;
    case sendAarFlowStates.ko:
      return maybeIunFromAarFlowState(data.previousState);
    default:
      return undefined;
  }
};

type AarFlowDefaultState =
  | NotInitialized
  | DisplayingTos
  | FetchQR
  | FetchNotification
  | DisplayingNotification;
type AarFlowDelegatedState =
  | NotAddressee
  | CreateMandate
  | CieCanAdvisory
  | CieCanInsertion
  | CieScanningAdvisory
  | AndroidNFCActivation
  | CieScanning
  | ValidatingMandate;
type AarErrorStates = FinalNotAddressee | NfcNotSupportedFinal | ErrorState;

export type AarFlowState =
  | AarFlowDefaultState
  | AarFlowDelegatedState
  | AarErrorStates;

export type AarStatesByName = {
  [K in AarFlowStateName]: Extract<AarFlowState, { type: K }>;
};
