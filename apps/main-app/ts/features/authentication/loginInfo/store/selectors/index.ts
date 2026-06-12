import { GlobalState } from "../../../../../store/reducers/types";

export const userFromSuccessLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.loginInfo.userFromSuccessLogin;
