import { fromNullable } from "fp-ts/lib/Option";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  getValue,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import {
  bpdDetailsLoadAll,
  bpdLoadActivationStatus
} from "../../../actions/details";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdUnsubscribeCompleted
} from "../../../actions/onboarding";
import paymentInstrumentReducer, {
  bpdUpsertIbanSelector,
  PayoffInstrumentType
} from "./payoffInstrument";

export type BpdActivation = {
  enabled: pot.Pot<boolean, Error>;
  payoffInstr: PayoffInstrumentType;
  unsubscription: RemoteValue<true, Error>;
};

/**
 * This reducer keeps the enabled status sync with the remote endpoint.
 * This value can change when:
 * - The application loads the first time the value
 * - The user chooses to activate the bpd program
 * - The user chooses to unsubscribe from the bpd program
 * @param state
 * @param action
 */
// TODO: check if the logic is ok
const enabledReducer = (
  state: pot.Pot<boolean, Error> = pot.none,
  action: Action
): pot.Pot<boolean, Error> => {
  switch (action.type) {
    case getType(bpdDetailsLoadAll):
    case getType(bpdLoadActivationStatus.request):
    case getType(bpdEnrollUserToProgram.request):
      return pot.toLoading(state);
    case getType(bpdLoadActivationStatus.success):
    case getType(bpdEnrollUserToProgram.success):
      return pot.some(action.payload.enabled);
    case getType(bpdDeleteUserFromProgram.success):
      return pot.none;
    case getType(bpdLoadActivationStatus.failure):
    case getType(bpdEnrollUserToProgram.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Keep the state of "unsubscribe" from bpd outcome
 * @param state
 * @param action
 */
const unsubscriptionReducer = (
  state: RemoteValue<true, Error> = remoteUndefined,
  action: Action
): RemoteValue<true, Error> => {
  switch (action.type) {
    case getType(bpdDeleteUserFromProgram.request):
      return remoteLoading;
    case getType(bpdDeleteUserFromProgram.success):
      return remoteReady(true);
    case getType(bpdDeleteUserFromProgram.failure):
      return remoteError(action.payload);
    // reset the state when return to wallet
    case getType(bpdUnsubscribeCompleted):
      return remoteUndefined;
  }
  return state;
};

const bpdActivationReducer = combineReducers<BpdActivation, Action>({
  enabled: enabledReducer,
  payoffInstr: paymentInstrumentReducer,
  unsubscription: unsubscriptionReducer
});

/**
 * Return the enabled value related to the bpd program
 * @param state
 */
export const bpdEnabledSelector = (
  state: GlobalState
): pot.Pot<boolean, Error> => state.bonus.bpd.details.activation.enabled;

/**
 * Return the Iban that the user has entered to receive the cashback amount
 * @return {RemoteValue<string | undefined, Error>}
 */
export const bpdIbanSelector = createSelector<
  GlobalState,
  RemoteValue<string | undefined, Error>,
  RemoteValue<string | undefined, Error>
>(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.activation.payoffInstr.enrolledValue
  ],
  iban => iban
);

/**
 * Return the unsubscription state, memoized
 */
export const bpdUnsubscriptionSelector = createSelector(
  [(state: GlobalState) => state.bonus.bpd.details.activation.unsubscription],
  unsubscription => unsubscription
);

/**
 * Return the prefill text based on the iban upsert or iban inserted by user
 * if the user tried to add a new iban (upsertIban.value !== undefined) return that iban
 * else try to return the actual iban getValue(iban)
 *
 */
export const bpdIbanPrefillSelector = createSelector(
  [bpdIbanSelector, bpdUpsertIbanSelector],
  (iban, upsertIban): string =>
    fromNullable(upsertIban.value as string).getOrElse(
      fromNullable(getValue(iban)).getOrElse("")
    )
);

export default bpdActivationReducer;
