import { GlobalState } from "../../../../store/reducers/types";

export const isCieLoginUatEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.useUat;

export const isCieIDTourGuideEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.isCieIDTourGuideEnabled;

export const cieIDSelectedSecurityLevelSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.cieIDSelectedSecurityLevel;
