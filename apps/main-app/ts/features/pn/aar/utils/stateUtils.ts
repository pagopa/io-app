import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

export type AarFlowStateName =
  SendAarFlowStatesType[keyof SendAarFlowStatesType];
export type RecipientInfo = {
  denomination: string;
  taxId: string;
};

export type SendAarFailurePhase =
  | "Create Mandate"
  | "Download Attachment"
  | "Entry Point"
  | "Fetch Notification"
  | "Fetch QRCode"
  | "Playground"
  | "Show Notification"
  | "Validate Mandate";

export type SendAarFlowStatesType = typeof sendAarFlowStates;

type AndroidNFCActivation = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["androidNFCActivation"];
  verificationCode: string;
};

type CieCanAdvisory = {
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["cieCanAdvisory"];
  verificationCode: string;
};

type CieCanInsertion = {
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["cieCanInsertion"];
  verificationCode: string;
};

type CieScanning = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["cieScanning"];
  verificationCode: string;
};

type CieScanningAdvisory = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["cieScanningAdvisory"];
  verificationCode: string;
};

type CreateMandate = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["creatingMandate"];
};

type DisplayingNotification = {
  iun: string;
  mandateId?: string;
  notification: ThirdPartyMessage;
  pnServiceId: ServiceId;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["displayingNotificationData"];
};

type DisplayingTos = {
  qrCode: string;
  type: SendAarFlowStatesType["displayingAarToS"];
};
type ErrorState = {
  debugData: {
    phase: SendAarFailurePhase;
    reason: string;
  };
  error?: AARProblemJson;
  previousState: AarFlowState;
  type: SendAarFlowStatesType["ko"];
};

type FetchNotification = {
  iun: string;
  mandateId?: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["fetchingNotificationData"];
};

type FetchQR = {
  qrCode: string;
  type: SendAarFlowStatesType["fetchingQRData"];
};

type FinalNotAddressee = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["notAddresseeFinal"];
};

type MrtdData = {
  dg1: string;
  dg11: string;
  sod: string;
};

type NfcNotSupportedFinal = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["nfcNotSupportedFinal"];
};

type NisData = {
  nis: string;
  publicKey: string;
  sod: string;
};

type NotAddressee = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAarFlowStatesType["notAddressee"];
};

type NotInitialized = {
  type: SendAarFlowStatesType["none"];
};

type ValidatingMandate = {
  iun: string;
  mandateId: string;
  mrtdData: MrtdData;
  nisData: NisData;
  recipientInfo: RecipientInfo;
  signedVerificationCode: string;
  type: SendAarFlowStatesType["validatingMandate"];
  unsignedVerificationCode: string;
};

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
  [
    sendAarFlowStates.androidNFCActivation,
    new Set([sendAarFlowStates.cieScanning])
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
    sendAarFlowStates.cieScanning,
    new Set([
      sendAarFlowStates.cieCanAdvisory,
      sendAarFlowStates.cieScanningAdvisory,
      sendAarFlowStates.validatingMandate
    ])
  ],
  [
    sendAarFlowStates.cieScanningAdvisory,
    new Set([
      sendAarFlowStates.androidNFCActivation,
      sendAarFlowStates.cieCanInsertion,
      sendAarFlowStates.cieScanning
    ])
  ],
  [
    sendAarFlowStates.creatingMandate,
    new Set([sendAarFlowStates.cieCanAdvisory, sendAarFlowStates.ko])
  ],
  [
    sendAarFlowStates.displayingAarToS,
    new Set([sendAarFlowStates.fetchingQRData])
  ],
  [sendAarFlowStates.displayingNotificationData, new Set([])],
  [
    sendAarFlowStates.fetchingNotificationData,
    new Set([
      sendAarFlowStates.displayingNotificationData,
      sendAarFlowStates.ko
    ])
  ],
  [
    sendAarFlowStates.fetchingQRData,
    new Set([
      sendAarFlowStates.fetchingNotificationData,
      sendAarFlowStates.ko,
      sendAarFlowStates.notAddressee,
      sendAarFlowStates.notAddresseeFinal
    ])
  ],
  [
    sendAarFlowStates.ko,
    new Set([
      sendAarFlowStates.cieCanAdvisory,
      sendAarFlowStates.fetchingNotificationData,
      sendAarFlowStates.fetchingQRData
    ])
  ],
  [sendAarFlowStates.none, new Set([sendAarFlowStates.displayingAarToS])],
  [
    sendAarFlowStates.notAddressee,
    new Set([
      sendAarFlowStates.creatingMandate,
      sendAarFlowStates.nfcNotSupportedFinal
    ])
  ],
  [sendAarFlowStates.notAddresseeFinal, new Set([])],
  [
    sendAarFlowStates.validatingMandate,
    new Set([sendAarFlowStates.fetchingNotificationData, sendAarFlowStates.ko])
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
    case sendAarFlowStates.displayingNotificationData:
    case sendAarFlowStates.fetchingNotificationData:
    case sendAarFlowStates.notAddresseeFinal:
      return data.iun;
    case sendAarFlowStates.ko:
      return maybeIunFromAarFlowState(data.previousState);
    default:
      return undefined;
  }
};

export type AarFlowState =
  | AarErrorStates
  | AarFlowDefaultState
  | AarFlowDelegatedState;
export type AarStatesByName = {
  [K in AarFlowStateName]: Extract<AarFlowState, { type: K }>;
};
type AarErrorStates = ErrorState | FinalNotAddressee | NfcNotSupportedFinal;

type AarFlowDefaultState =
  | DisplayingNotification
  | DisplayingTos
  | FetchNotification
  | FetchQR
  | NotInitialized;

type AarFlowDelegatedState =
  | AndroidNFCActivation
  | CieCanAdvisory
  | CieCanInsertion
  | CieScanning
  | CieScanningAdvisory
  | CreateMandate
  | NotAddressee
  | ValidatingMandate;
