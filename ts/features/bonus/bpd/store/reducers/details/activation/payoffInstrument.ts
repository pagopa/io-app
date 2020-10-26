import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Iban } from "../../../../../../../../definitions/backend/Iban";
import { Action } from "../../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import { IbanStatus } from "../../../../saga/networking/patchCitizenIban";
import { bpdLoadActivationStatus } from "../../../actions/details";
import {
  bpdIbanInsertionResetScreen,
  bpdUpsertIban
} from "../../../actions/iban";

type UpsertIBAN = {
  // the results of the upsert operation
  outcome: RemoteValue<IbanStatus, Error>;
  // the value the user is trying to enter
  value: Iban | undefined;
};

export type PayoffInstrumentType = {
  enrolledValue: RemoteValue<string | undefined, Error>;
  upsert: UpsertIBAN;
};

/**
 * This reducer keeps the latest valid paymentInstrument (IBAN) for the user.
 * This value can change when:
 * - The application load the first time the value
 * - The user choose to edit / add a new paymentInstrument and the operation is completed with success.
 * @param state
 * @param action
 */
const paymentInstrumentValueReducer = (
  state: RemoteValue<string | undefined, Error> = remoteUndefined,
  action: Action
): RemoteValue<string | undefined, Error> => {
  switch (action.type) {
    case getType(bpdLoadActivationStatus.request):
      return remoteLoading;
    case getType(bpdLoadActivationStatus.success):
      return remoteReady(action.payload.payoffInstr);
    case getType(bpdUpsertIban.success):
      return action.payload.status === IbanStatus.NOT_VALID
        ? state
        : remoteReady(action.payload.payoffInstr);
    case getType(bpdLoadActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

const INITIAL_UPSERT: UpsertIBAN = {
  outcome: remoteUndefined,
  value: undefined
};

/**
 * This reducer updates the state of the upsert operation.
 * @param state
 * @param action
 */
const paymentInstrumentUpsertReducer = (
  state: UpsertIBAN = INITIAL_UPSERT,
  action: Action
): UpsertIBAN => {
  switch (action.type) {
    case getType(bpdUpsertIban.request):
      return {
        value: action.payload,
        outcome: remoteLoading
      };
    case getType(bpdUpsertIban.success):
      return {
        value:
          action.payload.status === IbanStatus.NOT_VALID
            ? state.value
            : action.payload.payoffInstr,
        outcome: remoteReady(action.payload.status)
      };
    case getType(bpdUpsertIban.failure):
      return {
        ...state,
        outcome: remoteError(action.payload)
      };
    case getType(bpdIbanInsertionResetScreen):
      return {
        ...state,
        outcome: remoteUndefined
      };
  }
  return state;
};

/**
 * Return the Iban that is currently used for an upsert operation.
 * This is not the current Iban associated to the bpd program, but only a candidate.
 * @param state
 */
export const bpdUpsertIbanSelector = (state: GlobalState): UpsertIBAN =>
  state.bonus.bpd.details.activation.payoffInstr.upsert;

/**
 * Return true if the iban upsertion received errors
 * @param state
 */
export const bpdUpsertIbanIsError = (state: GlobalState): boolean =>
  isError(state.bonus.bpd.details.activation.payoffInstr.upsert.outcome);

const paymentInstrumentReducer = combineReducers<PayoffInstrumentType, Action>({
  // value is the effective value of the iban enrolled to the bpd program.
  // it's the remote saved value.
  enrolledValue: paymentInstrumentValueReducer,
  // all the information related to the try to upsert a new iban.
  upsert: paymentInstrumentUpsertReducer
});

export default paymentInstrumentReducer;
