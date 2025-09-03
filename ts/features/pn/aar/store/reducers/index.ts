import { getType } from "typesafe-actions";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { setAarFlowState, terminateAarFlow } from "../actions";

export const sendAARFlowStates = {
  none: "none",
  displayingAARToS: "displayingAARToS",
  fetchingQRData: "fetchingQRData",
  fetchingNotificationData: "fetchingNotificationData",
  displayingNotificationData: "displayingNotificationData",
  notAddresseeFinal: "notAddresseeFinal"
} as const;

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

export type AARFlowState =
  | NotInitialized
  | DisplayingTos
  | FetchQR
  | FetchNotification
  | DisplayingNotification
  | FinalNotAddressee;

export const INITIAL_AAR_FLOW_STATE: AARFlowState = {
  type: "none"
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
      return action.payload;

    case getType(terminateAarFlow):
      return INITIAL_AAR_FLOW_STATE;
  }
  return state;
};

export const currentAARFlowStateType = (
  state: GlobalState
): FlowStates[keyof FlowStates] => state.features.pn.aarFlow.type;

export const currentAARFlowStateData = (state: GlobalState): AARFlowState =>
  state.features.pn.aarFlow;
