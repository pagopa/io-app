import { getType } from "typesafe-actions";
import { setIsBlockingScreen, setOfflineAccessReason } from "../actions";
import { Action } from "../../../../store/actions/types";

export enum OfflineAccessReasonEnum {
  DEVICE_OFFLINE = "DEVICE_OFFLINE", // The device is offline when the app is started
  SESSION_REFRESH = "SESSION_REFRESH", // Error on session refresh
  SESSION_EXPIRED = "SESSION_EXPIRED" // Session has expired or user has logged out
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
    default:
      return state;
  }
};
