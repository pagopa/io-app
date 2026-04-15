import { getType } from "typesafe-actions";
import {
  resetOfflineAccessReason,
  setIsBlockingScreen,
  setOfflineAccessReason
} from "../actions";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { Action } from "../../../../store/actions/types";

export enum OfflineAccessReasonEnum {
  DEVICE_OFFLINE = "device_offline", // The device is offline when the app is started
  SESSION_REFRESH = "session_refresh", // Error on session refresh
  SESSION_EXPIRED = "session_expired", // Session has expired or user has logged out
  TIMEOUT = "timeout" // The app has not been able to connect to the backend within a certain time
}
export type IngressScreenState = {
  isBlockingScreen: boolean;
  offlineAccessReason?: OfflineAccessReasonEnum;
  checkSession: {
    hasError: boolean;
  };
};

export const initialIngressScreenState: IngressScreenState = {
  isBlockingScreen: false,
  checkSession: {
    hasError: false
  }
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
    case getType(checkCurrentSession.request):
    case getType(checkCurrentSession.success):
      return {
        ...state,
        checkSession: { hasError: false }
      };
    case getType(checkCurrentSession.failure):
      return {
        ...state,
        checkSession: { hasError: true }
      };
    default:
      return state;
  }
};
