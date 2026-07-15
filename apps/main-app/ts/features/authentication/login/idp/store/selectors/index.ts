import { GlobalState } from "../../../../../../store/reducers/types";

export const spidLoginRequestInfoSelector = (state: GlobalState) =>
  state.features.loginFeatures.spidLogin.requestInfo;
