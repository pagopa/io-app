import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { disableNativeAuthentication } from "../../../common/store/actions";
import { GlobalState } from "../../../../../store/reducers/types";

export type NativeLoginState = {
  enabled: boolean;
};

export const nativeLoginSelector = (state: GlobalState): NativeLoginState =>
  state.features.loginFeatures.nativeLogin;

export const nativeLoginReducer = (
  state: NativeLoginState = { enabled: true },
  action: Action
): NativeLoginState => {
  switch (action.type) {
    case getType(disableNativeAuthentication):
      return {
        enabled: false
      };

    default:
      return state;
  }
};
