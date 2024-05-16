import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

/**
 * Selects the PID pod state from the global state.
 * @param state - the global state
 * @returns the PID pot state.
 */
export const itwIssuanceEidSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.eid;

/**
 * Selects the PID value from the global state.
 * @param state - the global state
 * @returns the pid value.
 */
export const itwIssuanceEidValueSelector = (state: GlobalState) =>
  pot.toOption(state.features.itWallet.issuance.eid);
