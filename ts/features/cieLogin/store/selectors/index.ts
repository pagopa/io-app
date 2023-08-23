import { GlobalState } from "../../../../store/reducers/types";

export const isCieLoginUatEnabledSelector = (state: GlobalState) =>
  state.features.loginFeatures.cieLogin.useUat;
