import { GlobalState } from "../../../../../store/reducers/types";

export const loginSuccededSelector = (state: GlobalState) =>
  state.features.loginFeatures.loginInfo.loginSucceded;
