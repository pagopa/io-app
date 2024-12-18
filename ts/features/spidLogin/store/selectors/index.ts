import { GlobalState } from "../../../../store/reducers/types";

export const nativeLoginRequestInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.spidLogin.nativeLogin.requestInfo;

export const standardLoginRequestInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.spidLogin.standardLogin.requestInfo;
