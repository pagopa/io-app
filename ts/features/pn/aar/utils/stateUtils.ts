import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";

export type SendAARFlowStatesType = typeof sendAARFlowStates;
export type SendAARFailurePhase =
  | "Download Attachment"
  | "Entry Point"
  | "Fetch Notification"
  | "Fetch QRCode"
  | "Show Notification";

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
  type: SendAARFlowStatesType["none"];
};

type DisplayingTos = {
  type: SendAARFlowStatesType["displayingAARToS"];
  qrCode: string;
};

type FetchQR = {
  type: SendAARFlowStatesType["fetchingQRData"];
  qrCode: string;
};

type FetchNotification = {
  type: SendAARFlowStatesType["fetchingNotificationData"];
  iun: string;
  recipientInfo: RecipientInfo;
  mandateId?: string;
};

type DisplayingNotification = {
  type: SendAARFlowStatesType["displayingNotificationData"];
  recipientInfo: RecipientInfo;
  notification: ThirdPartyMessage;
  iun: string;
  pnServiceId: ServiceId;
  mandateId?: string;
};

type FinalNotAddressee = {
  type: SendAARFlowStatesType["notAddresseeFinal"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type NotAddressee = {
  type: SendAARFlowStatesType["notAddressee"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type CreateMandate = {
  type: SendAARFlowStatesType["creatingMandate"];
  recipientInfo: RecipientInfo;
  qrCode: string;
  iun: string;
};

type CieCanAdvisory = {
  type: SendAARFlowStatesType["cieCanAdvisory"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
};

type CieCanInsertion = {
  type: SendAARFlowStatesType["cieCanInsertion"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
};

type CieScanningAdvisory = {
  type: SendAARFlowStatesType["cieScanningAdvisory"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type AndroidNFCActivation = {
  type: SendAARFlowStatesType["androidNFCActivation"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type CieScanning = {
  type: SendAARFlowStatesType["cieScanning"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  verificationCode: string;
  can: string;
};

type ValidateMandate = {
  type: SendAARFlowStatesType["validatingMandate"];
  recipientInfo: RecipientInfo;
  iun: string;
  mandateId: string;
  mrtdData: MrtdData;
  nisData: NisData;
  signedVerificationCode: string;
};

type ErrorState = {
  type: SendAARFlowStatesType["ko"];
  previousState: AARFlowState;
  error?: AARProblemJson;
  debugData: {
    phase: SendAARFailurePhase;
    reason: string;
  };
};

export type AARFlowStateName =
  SendAARFlowStatesType[keyof SendAARFlowStatesType];

const sendAARFlowDefaultStates = {
  none: "none",
  displayingAARToS: "displayingAARToS",
  fetchingQRData: "fetchingQRData",
  fetchingNotificationData: "fetchingNotificationData",
  displayingNotificationData: "displayingNotificationData",
  notAddresseeFinal: "notAddresseeFinal",
  ko: "ko"
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

export const sendAARFlowStates = {
  ...sendAARFlowDefaultStates,
  ...sendAARFlowDelegatedStates
} as const;

export const validAARStatusTransitions = new Map<
  AARFlowState["type"],
  Set<AARFlowState["type"]>
>([
  [sendAARFlowStates.none, new Set([sendAARFlowStates.displayingAARToS])],
  [
    sendAARFlowStates.displayingAARToS,
    new Set([sendAARFlowStates.fetchingQRData])
  ],
  [
    sendAARFlowStates.fetchingQRData,
    new Set([
      sendAARFlowStates.fetchingNotificationData,
      sendAARFlowStates.notAddresseeFinal,
      sendAARFlowStates.notAddressee,
      sendAARFlowStates.ko
    ])
  ],
  [
    sendAARFlowStates.fetchingNotificationData,
    new Set([
      sendAARFlowStates.displayingNotificationData,
      sendAARFlowStates.ko
    ])
  ],
  [sendAARFlowStates.displayingNotificationData, new Set([])],
  [sendAARFlowStates.notAddresseeFinal, new Set([])],
  [
    sendAARFlowStates.ko,
    new Set([
      sendAARFlowStates.fetchingQRData,
      sendAARFlowStates.fetchingNotificationData
    ])
  ],
  [
    sendAARFlowStates.notAddressee,
    new Set([sendAARFlowStates.creatingMandate])
  ],
  [
    sendAARFlowStates.creatingMandate,
    new Set([sendAARFlowStates.cieCanAdvisory, sendAARFlowStates.ko])
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
    sendAARFlowStates.cieScanningAdvisory,
    new Set([
      sendAARFlowStates.cieCanInsertion,
      sendAARFlowStates.androidNFCActivation,
      sendAARFlowStates.cieScanning
    ])
  ],
  [
    sendAARFlowStates.androidNFCActivation,
    new Set([sendAARFlowStates.cieScanning])
  ],
  [
    sendAARFlowStates.cieScanning,
    new Set([
      sendAARFlowStates.cieScanningAdvisory,
      sendAARFlowStates.validatingMandate
    ])
  ],
  [
    sendAARFlowStates.validatingMandate,
    new Set([
      sendAARFlowStates.ko,
      sendAARFlowStates.displayingNotificationData
    ])
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
    case sendAARFlowStates.notAddresseeFinal:
    case sendAARFlowStates.fetchingNotificationData:
    case sendAARFlowStates.displayingNotificationData:
      return data.iun;
    case sendAARFlowStates.ko:
      return maybeIunFromAarFlowState(data.previousState);
    default:
      return undefined;
  }
};

type AARFlowDefaultState =
  | NotInitialized
  | DisplayingTos
  | FetchQR
  | FetchNotification
  | DisplayingNotification
  | FinalNotAddressee
  | ErrorState;

type AARFlowDelegatedState =
  | NotAddressee
  | CreateMandate
  | CieCanAdvisory
  | CieCanInsertion
  | CieScanningAdvisory
  | AndroidNFCActivation
  | CieScanning
  | ValidateMandate;

export type AARFlowState = AARFlowDefaultState | AARFlowDelegatedState;
