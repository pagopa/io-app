import { GlobalState } from "../../../../../../store/reducers/types";

export const isCieLoginUatEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.useUat;

export const isCieIDTourGuideEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.isCieIDTourGuideEnabled;

export const cieIDSelectedSecurityLevelSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.cieIDSelectedSecurityLevel;

export const hasNFCFeatureSelector = (state: GlobalState) =>
  state.cie.hasNFCFeature;

export const hasApiLevelSupportSelector = (state: GlobalState) =>
  state.cie.hasApiLevelSupport;

export const isCieSupportedSelector = (state: GlobalState) =>
  state.cie.isCieSupported;

export const isNfcEnabledSelector = (state: GlobalState) =>
  state.cie.isNfcEnabled;

export const readingEventSelector = (state: GlobalState) =>
  state.cie.readingEvent;
