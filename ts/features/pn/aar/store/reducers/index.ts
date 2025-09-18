import { getType } from "typesafe-actions";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import { Action } from "../../../../../store/actions/types";
import { isAARRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isAARLocalEnabled } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { setAarFlowState, terminateAarFlow } from "../actions";

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

type FlowStates = typeof sendAARFlowStates;

type NotInitialized = {
  type: FlowStates["none"];
};

type DisplayingTos = {
  type: FlowStates["displayingAARToS"];
  qrCode: string;
};

type FetchQR = {
  type: FlowStates["fetchingQRData"];
  qrCode: string;
};

type FetchNotification = {
  type: FlowStates["fetchingNotificationData"];
  iun: string;
  fullNameDestinatario: string;
  mandateId?: string;
};

type DisplayingNotification = {
  type: FlowStates["displayingNotificationData"];
  fullNameDestinatario: string;
  notification: ThirdPartyMessage;
  mandateId?: string;
};

type FinalNotAddressee = {
  type: FlowStates["notAddresseeFinal"];
  fullNameDestinatario: string;
  qrCode: string;
  iun: string;
};

type ErrorState = {
  type: FlowStates["ko"];
  errorKind?: string;
  previousState: AARFlowState;
};

export type AARFlowState =
  | NotInitialized
  | DisplayingTos
  | FetchQR
  | FetchNotification
  | DisplayingNotification
  | FinalNotAddressee
  | ErrorState;

export const INITIAL_AAR_FLOW_STATE: AARFlowState = {
  type: "none"
};

export const isValidAARStateTransition = (
  currentType: FlowStates[keyof FlowStates],
  nextType: FlowStates[keyof FlowStates]
): boolean => {
  const allowedNextStates = validAARStatusTransitions.get(currentType);
  return allowedNextStates?.has(nextType) ?? false;
};

/**
 * A reducer to store the AAR flow state
 */
export const aarFlowReducer = (
  state: AARFlowState = INITIAL_AAR_FLOW_STATE,
  action: Action
): AARFlowState => {
  switch (action.type) {
    case getType(setAarFlowState):
      return isValidAARStateTransition(state.type, action.payload.type)
        ? action.payload
        : { ...state };

    case getType(terminateAarFlow):
      return INITIAL_AAR_FLOW_STATE;
  }
  return state;
};

export const isAAREnabled = (state: GlobalState): boolean =>
  isAARLocalEnabled(state) && isAARRemoteEnabled(state);

export const currentAARFlowData = (state: GlobalState) =>
  state.features.pn.aarFlow;
export const currentAARFlowStateType = (state: GlobalState) =>
  state.features.pn.aarFlow.type;
