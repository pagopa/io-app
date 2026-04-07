import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";

export type AARFlowStateName =
  SendAARFlowStatesType[keyof SendAARFlowStatesType];
export type RecipientInfo = {
  denomination: string;
  taxId: string;
};

export type SendAARFailurePhase =
  | "Create Mandate"
  | "Download Attachment"
  | "Entry Point"
  | "Fetch Notification"
  | "Fetch QRCode"
  | "Playground"
  | "Show Notification"
  | "Validate Mandate";

export type SendAARFlowStatesType = typeof sendAARFlowStates;

type AndroidNFCActivation = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["androidNFCActivation"];
  verificationCode: string;
};

type CieCanAdvisory = {
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["cieCanAdvisory"];
  verificationCode: string;
};

type CieCanInsertion = {
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["cieCanInsertion"];
  verificationCode: string;
};

type CieScanning = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["cieScanning"];
  verificationCode: string;
};

type CieScanningAdvisory = {
  can: string;
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["cieScanningAdvisory"];
  verificationCode: string;
};

type CreateMandate = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["creatingMandate"];
};

type DisplayingNotification = {
  iun: string;
  mandateId?: string;
  notification: ThirdPartyMessage;
  pnServiceId: ServiceId;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["displayingNotificationData"];
};

type DisplayingTos = {
  qrCode: string;
  type: SendAARFlowStatesType["displayingAARToS"];
};
type ErrorState = {
  debugData: {
    phase: SendAARFailurePhase;
    reason: string;
  };
  error?: AARProblemJson;
  previousState: AARFlowState;
  type: SendAARFlowStatesType["ko"];
};

type FetchNotification = {
  iun: string;
  mandateId?: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["fetchingNotificationData"];
};

type FetchQR = {
  qrCode: string;
  type: SendAARFlowStatesType["fetchingQRData"];
};

type FinalNotAddressee = {
  iun: string;
  qrCode: string;
  recipientInfo: RecipientInfo;
  type: SendAARFlowStatesType["notAddresseeFinal"];
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
  type: SendAARFlowStatesType["nfcNotSupportedFinal"];
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
  type: SendAARFlowStatesType["notAddressee"];
};

type NotInitialized = {
  type: SendAARFlowStatesType["none"];
};

type ValidatingMandate = {
  iun: string;
  mandateId: string;
  mrtdData: MrtdData;
  nisData: NisData;
  recipientInfo: RecipientInfo;
  signedVerificationCode: string;
  type: SendAARFlowStatesType["validatingMandate"];
  unsignedVerificationCode: string;
};

const sendAARFlowDefaultStates = {
  none: "none",
  displayingAARToS: "displayingAARToS",
  fetchingQRData: "fetchingQRData",
  fetchingNotificationData: "fetchingNotificationData",
  displayingNotificationData: "displayingNotificationData"
} as const;

const sendAARFlowDelegatedStates = {
  notAddressee: "notAddressee",
  creatingMandate: "creatingMandate",
  cieCanAdvisory: "cieCanAdvisory",
  cieCanInsertion: "cieCanInsertion",
  cieScanningAdvisory: "cieScanningAdvisory",
  androidNFCActivation: "androidNFCActivation",
  validatingMandate: "validatingMandate",
  cieScanning: "cieScanning"
} as const;

const sendAARFailureStates = {
  notAddresseeFinal: "notAddresseeFinal",
  nfcNotSupportedFinal: "nfcNotSupportedFinal",
  ko: "ko"
} as const;

export const sendAARFlowStates = {
  ...sendAARFlowDefaultStates,
  ...sendAARFlowDelegatedStates,
  ...sendAARFailureStates
} as const;

export const validAARStatusTransitions = new Map<
  AARFlowState["type"],
  Set<AARFlowState["type"]>
>([
  [
    sendAARFlowStates.androidNFCActivation,
    new Set([sendAARFlowStates.cieScanning])
  ],
  [
    sendAARFlowStates.cieCanAdvisory,
    new Set([sendAARFlowStates.cieCanInsertion])
  ],
  [
    sendAARFlowStates.cieCanInsertion,
    new Set([
      sendAARFlowStates.cieCanAdvisory,
      sendAARFlowStates.cieScanningAdvisory
    ])
  ],
  [
    sendAARFlowStates.cieScanning,
    new Set([
      sendAARFlowStates.cieCanAdvisory,
      sendAARFlowStates.cieScanningAdvisory,
      sendAARFlowStates.validatingMandate
    ])
  ],
  [
    sendAARFlowStates.cieScanningAdvisory,
    new Set([
      sendAARFlowStates.androidNFCActivation,
      sendAARFlowStates.cieCanInsertion,
      sendAARFlowStates.cieScanning
    ])
  ],
  [
    sendAARFlowStates.creatingMandate,
    new Set([sendAARFlowStates.cieCanAdvisory, sendAARFlowStates.ko])
  ],
  [
    sendAARFlowStates.displayingAARToS,
    new Set([sendAARFlowStates.fetchingQRData])
  ],
  [sendAARFlowStates.displayingNotificationData, new Set([])],
  [
    sendAARFlowStates.fetchingNotificationData,
    new Set([
      sendAARFlowStates.displayingNotificationData,
      sendAARFlowStates.ko
    ])
  ],
  [
    sendAARFlowStates.fetchingQRData,
    new Set([
      sendAARFlowStates.fetchingNotificationData,
      sendAARFlowStates.ko,
      sendAARFlowStates.notAddressee,
      sendAARFlowStates.notAddresseeFinal
    ])
  ],
  [
    sendAARFlowStates.ko,
    new Set([
      sendAARFlowStates.cieCanAdvisory,
      sendAARFlowStates.fetchingNotificationData,
      sendAARFlowStates.fetchingQRData
    ])
  ],
  [sendAARFlowStates.none, new Set([sendAARFlowStates.displayingAARToS])],
  [
    sendAARFlowStates.notAddressee,
    new Set([
      sendAARFlowStates.creatingMandate,
      sendAARFlowStates.nfcNotSupportedFinal
    ])
  ],
  [sendAARFlowStates.notAddresseeFinal, new Set([])],
  [
    sendAARFlowStates.validatingMandate,
    new Set([sendAARFlowStates.fetchingNotificationData, sendAARFlowStates.ko])
  ]
]);

export const isValidAARStateTransition = (
  currentType: AARFlowStateName,
  nextType: AARFlowStateName
): boolean => {
  const allowedNextStates = validAARStatusTransitions.get(currentType);
  return allowedNextStates?.has(nextType) ?? false;
};

export const maybeIunFromAarFlowState = (
  data: AARFlowState
): string | undefined => {
  switch (data.type) {
    case sendAARFlowStates.displayingNotificationData:
    case sendAARFlowStates.fetchingNotificationData:
    case sendAARFlowStates.notAddresseeFinal:
      return data.iun;
    case sendAARFlowStates.ko:
      return maybeIunFromAarFlowState(data.previousState);
    default:
      return undefined;
  }
};

export type AARFlowState =
  | AarErrorStates
  | AARFlowDefaultState
  | AARFlowDelegatedState;
export type AarStatesByName = {
  [K in AARFlowStateName]: Extract<AARFlowState, { type: K }>;
};
type AarErrorStates = ErrorState | FinalNotAddressee | NfcNotSupportedFinal;

type AARFlowDefaultState =
  | DisplayingNotification
  | DisplayingTos
  | FetchNotification
  | FetchQR
  | NotInitialized;

type AARFlowDelegatedState =
  | AndroidNFCActivation
  | CieCanAdvisory
  | CieCanInsertion
  | CieScanning
  | CieScanningAdvisory
  | CreateMandate
  | NotAddressee
  | ValidatingMandate;
