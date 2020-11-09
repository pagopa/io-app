import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import { bpdLoadActivationStatus } from "../../../actions/details";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram
} from "../../../actions/onboarding";
import paymentInstrumentReducer, {
  PayoffInstrumentType
} from "./payoffInstrument";

export type BpdActivation = {
  enabled: RemoteValue<boolean, Error>;
  payoffInstr: PayoffInstrumentType;
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
  state: RemoteValue<boolean, Error> = remoteUndefined,
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(bpdLoadActivationStatus.request):
    case getType(bpdEnrollUserToProgram.request):
      return remoteLoading;
    case getType(bpdLoadActivationStatus.success):
    case getType(bpdEnrollUserToProgram.success):
      return remoteReady(action.payload.enabled);
    case getType(bpdDeleteUserFromProgram.success):
      return remoteUndefined;
    case getType(bpdLoadActivationStatus.failure):
    case getType(bpdEnrollUserToProgram.failure):
      return remoteError(action.payload);
  }
  return state;
};

const bpdActivationReducer = combineReducers<BpdActivation, Action>({
  enabled: enabledReducer,
  payoffInstr: paymentInstrumentReducer
});

/**
 * Return the enabled value related to the bpd program
 * @param state
 */
export const bpdEnabledSelector = (
  state: GlobalState
): RemoteValue<boolean, Error> => state.bonus.bpd.details.activation.enabled;

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

export default bpdActivationReducer;
