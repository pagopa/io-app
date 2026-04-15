import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";

export const spidLoginSelector = (state: GlobalState) =>
  state.features.loginFeatures.spidLogin;

export const nativeLoginRequestInfoSelector = createSelector(
  spidLoginSelector,
  ({ nativeLogin }) => nativeLogin.requestInfo
);

export const standardLoginRequestInfoSelector = createSelector(
  spidLoginSelector,
  ({ standardLogin }) => standardLogin.requestInfo
);
