import { getType } from "typesafe-actions";
import {
  resetOfflineAccessReason,
  setIsBlockingScreen,
  setOfflineAccessReason
} from "../actions";
import { Action } from "../../../../store/actions/types";

export enum OfflineAccessReasonEnum {
  DEVICE_OFFLINE = "device_offline", // The device is offline when the app is started
  SESSION_REFRESH = "session_refresh", // Error on session refresh
  SESSION_EXPIRED = "session_expired" // Session has expired or user has logged out
}
export type IngressScreenState = {
  isBlockingScreen: boolean;
  offlineAccessReason?: OfflineAccessReasonEnum;
};

export const initialIngressScreenState: IngressScreenState = {
  isBlockingScreen: false
};

export const ingressScreenReducer = (
  state = initialIngressScreenState,
  action: Action
): IngressScreenState => {
  switch (action.type) {
    case getType(setIsBlockingScreen):
      return {
        ...state,
        isBlockingScreen: true
      };
    case getType(setOfflineAccessReason):
      return {
        ...state,
        offlineAccessReason: action.payload
      };
    // reset value of offlineAccessReason when user back online
    // Evaluate whether this data reset is needed
    case getType(resetOfflineAccessReason):
      return {
        ...state,
        offlineAccessReason: undefined
      };
    default:
      return state;
  }
};
