import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
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
  ActivationStatus,
  bpdLoadActivationStatus
} from "../../../actions/details";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdUnsubscribeCompleted,
  bpdUnsubscribeFailure,
  bpdUpdateOptInStatusMethod
} from "../../../actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import { optInPaymentMethodsStart } from "../../../actions/optInPaymentMethods";
import paymentInstrumentReducer, {
  bpdUpsertIbanSelector,
  PayoffInstrumentType
} from "./payoffInstrument";
import technicalAccountReducer, {
  bpdTechnicalAccountSelector
} from "./technicalAccount";
import { bpdActivationUiReducer, BpdActivationUiState } from "./ui";

export type BpdActivation = {
  enabled: pot.Pot<boolean, Error>;
  activationStatus: RemoteValue<ActivationStatus, Error>;
  payoffInstr: PayoffInstrumentType;
  unsubscription: RemoteValue<true, Error>;
  technicalAccount: RemoteValue<string | undefined, Error>;
  optInStatus: pot.Pot<CitizenOptInStatusEnum, Error>;
  ui: BpdActivationUiState;
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

const OPT_IN_INITIAL_STATE = pot.none;
const optInStatusReducer = (
  state: pot.Pot<CitizenOptInStatusEnum, Error> = OPT_IN_INITIAL_STATE,
  action: Action
): pot.Pot<CitizenOptInStatusEnum, Error> => {
  switch (action.type) {
    case getType(optInPaymentMethodsStart):
      return OPT_IN_INITIAL_STATE;
    case getType(bpdLoadActivationStatus.request):
      return pot.toLoading(state);
    case getType(bpdUpdateOptInStatusMethod.request):
      return pot.toUpdating(state, action.payload);
    case getType(bpdLoadActivationStatus.success):
      return action.payload.optInStatus
        ? pot.some(action.payload.optInStatus)
        : pot.none;
    case getType(bpdUpdateOptInStatusMethod.success):
      return pot.some(action.payload);
    case getType(bpdLoadActivationStatus.failure):
    case getType(bpdEnrollUserToProgram.failure):
    case getType(bpdUpdateOptInStatusMethod.failure):
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
    case getType(bpdUnsubscribeFailure):
      return remoteUndefined;
  }
  return state;
};

const activationStatusReducer = (
  state: RemoteValue<ActivationStatus, Error> = remoteUndefined,
  action: Action
): RemoteValue<ActivationStatus, Error> => {
  switch (action.type) {
    case getType(bpdLoadActivationStatus.request):
    case getType(bpdEnrollUserToProgram.request):
      return remoteLoading;
    case getType(bpdLoadActivationStatus.success):
    case getType(bpdEnrollUserToProgram.success):
      return remoteReady(action.payload.activationStatus);
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
  activationStatus: activationStatusReducer,
  payoffInstr: paymentInstrumentReducer,
  unsubscription: unsubscriptionReducer,
  technicalAccount: technicalAccountReducer,
  optInStatus: optInStatusReducer,
  ui: bpdActivationUiReducer
});

/**
 * Return the optInStatus value related to the bpd program
 * @param state
 */
export const optInStatusSelector = (
  state: GlobalState
): pot.Pot<CitizenOptInStatusEnum, Error> =>
  state.bonus.bpd.details.activation.optInStatus;

/**
 * Return the enabled value related to the bpd program
 * @param state
 */
export const bpdEnabledSelector = (
  state: GlobalState
): pot.Pot<boolean, Error> => state.bonus.bpd.details.activation.enabled;

/**
 * Return the enabled value related to the bpd activation status
 * @param state
 */
export const activationStatusSelector = (
  state: GlobalState
): RemoteValue<ActivationStatus, Error> =>
  state.bonus.bpd.details.activation.activationStatus;

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
  [bpdIbanSelector, bpdUpsertIbanSelector, bpdTechnicalAccountSelector],
  (iban, upsertIban, technicalAccount): string =>
    pipe(
      upsertIban.value as string,
      O.fromNullable,
      O.alt(() =>
        pipe(
          getValue(technicalAccount),
          O.fromNullable,
          O.map(_ => "")
        )
      ),
      O.alt(() => O.fromNullable(getValue(iban))),
      O.getOrElse(() => "")
    )
);

export default bpdActivationReducer;
