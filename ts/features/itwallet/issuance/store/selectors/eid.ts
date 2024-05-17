import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
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
  pot.getOrElse(state.features.itWallet.issuance.eid, O.none);
