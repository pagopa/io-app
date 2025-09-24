import { ThirdPartyMessage } from "../../../../../definitions/pn/ThirdPartyMessage";
import { isTestEnv } from "../../../../utils/environment";

export type SendAARFlowStatesType = typeof sendAARFlowStates;

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
  fullNameDestinatario: string;
  mandateId?: string;
};

type DisplayingNotification = {
  type: SendAARFlowStatesType["displayingNotificationData"];
  fullNameDestinatario: string;
  notification: ThirdPartyMessage;
  mandateId?: string;
};

type FinalNotAddressee = {
  type: SendAARFlowStatesType["notAddresseeFinal"];
  fullNameDestinatario: string;
  qrCode: string;
  iun: string;
};

type ErrorState = {
  type: SendAARFlowStatesType["ko"];
  errorKind: ErrorKind;
  previousState: AARFlowState;
};

type ValueOf<T> = T[keyof T];
type RetriableError = ValueOf<typeof retriableErrors>;

export type ErrorKind = ValueOf<typeof aarErrors>;
export type AARFlowStateName =
  SendAARFlowStatesType[keyof SendAARFlowStatesType];

const retriableErrors = {
  RETRIABLE_NOTIFICATION_FETCH: "RETRIABLE_NOTIFICATION_FETCH",
  RETRIABLE_QR_FETCH: "RETRIABLE_QR_FETCH"
} as const;
const finalErrors = {
  GENERIC: "GENERIC",
  NOTIFICATION_EXPIRED: "NOTIFICATION_EXPIRED",
  NOT_FOUND: "NOT_FOUND",
  CANCELED: "CANCELED"
} as const;

export const aarErrors = {
  ...retriableErrors,
  ...finalErrors
};

export const isAarErrorRetriable = (
  error: ErrorKind
): error is RetriableError =>
  retriableErrors[error as RetriableError] !== undefined;

export const sendAARFlowStates = {
  none: "none",
  displayingAARToS: "displayingAARToS",
  fetchingQRData: "fetchingQRData",
  fetchingNotificationData: "fetchingNotificationData",
  displayingNotificationData: "displayingNotificationData",
  notAddresseeFinal: "notAddresseeFinal",
  ko: "ko"
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
    new Set([sendAARFlowStates.fetchingNotificationData, sendAARFlowStates.ko])
  ],
  [
    sendAARFlowStates.fetchingNotificationData,
    new Set([
      sendAARFlowStates.displayingNotificationData,
      sendAARFlowStates.notAddresseeFinal,
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
  ]
]);
export const isValidAARStateTransition = (
  currentType: AARFlowStateName,
  nextType: AARFlowStateName
): boolean => {
  const allowedNextStates = validAARStatusTransitions.get(currentType);
  return allowedNextStates?.has(nextType) ?? false;
};
export type AARFlowState =
  | NotInitialized
  | DisplayingTos
  | FetchQR
  | FetchNotification
  | DisplayingNotification
  | FinalNotAddressee
  | ErrorState;

export const testable = isTestEnv
  ? { retriableErrors, finalErrors }
  : undefined;
