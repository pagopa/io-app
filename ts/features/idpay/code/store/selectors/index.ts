import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { IdPayCodeState } from "../reducers";

export const idPayCodeStateSelector = (state: GlobalState): IdPayCodeState =>
  state.features.idPay.code;

export const isIdPayCodeOnboardedSelector = createSelector(
  idPayCodeStateSelector,
  state => pot.getOrElse(state.isOnboarded, false)
);

export const idPayCodeSelector = createSelector(
  idPayCodeStateSelector,
  state => state.code
);
