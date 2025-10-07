import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ProblemJson } from "../../../../../definitions/pn/aar/ProblemJson";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";

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
  iun: string;
  pnServiceId: ServiceId;
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
  previousState: AARFlowState;
  error?: ProblemJson;
};

export type AARFlowStateName =
  SendAARFlowStatesType[keyof SendAARFlowStatesType];

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
    new Set([
      sendAARFlowStates.fetchingNotificationData,
      sendAARFlowStates.notAddresseeFinal,
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
export type AarFlowStates<T extends AARFlowStateName> = Extract<
  AARFlowState,
  { type: T }
>;
