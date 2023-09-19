import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { IdPayCodeState } from "../reducers";

export const idPayCodeStateSelector = (state: GlobalState): IdPayCodeState =>
  state.features.idPay.code;

export const isIdPayCodeOnboardedSelector = createSelector(
  idPayCodeStateSelector,
  state => state.isOnboarded
);

export const idPayCodeSelector = createSelector(
  idPayCodeStateSelector,
  state => state.code
);
