import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { IbanStatus } from "../../../saga/networking/patchCitizenIban";
import { bpdLoadActivationStatus } from "../../actions/details";
import { bpdUpsertIban } from "../../actions/iban";
import { bpdEnrollUserToProgram } from "../../actions/onboarding";

type UpsertIBAN = {
  outcome: RemoteValue<IbanStatus, Error>;
  value: Iban | undefined;
};

type PayoffInstrumentType = {
  value: RemoteValue<string | undefined, Error>;
  upsert: UpsertIBAN;
};

export type BpdActivation = {
  enabled: RemoteValue<boolean, Error>;
  payoffInstr: PayoffInstrumentType;
  // TODO: use definitions/backend/Iban.ts ?
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
// TODO: integrate with the unsubscribe
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
    case getType(bpdLoadActivationStatus.failure):
    case getType(bpdEnrollUserToProgram.failure):
      return remoteError(action.payload);
  }
  return state;
};
/**
 * This reducer keeps the paymentInstrument (IBAN) sync with the remote endpoint.
 * This value can change when:
 * - The application load the first time the value
 * - The user choose to edit / add a new paymentInstrument
 * @param state
 * @param action
 */
const paymentInstrumentValueReducer = (
  state: RemoteValue<string | undefined, Error> = remoteUndefined,
  action: Action
): RemoteValue<string | undefined, Error> => {
  switch (action.type) {
    case getType(bpdLoadActivationStatus.request):
    case getType(bpdUpsertIban.request):
      return remoteLoading;
    case getType(bpdLoadActivationStatus.success):
    case getType(bpdUpsertIban.success):
      return remoteReady(action.payload.payoffInstr);
    case getType(bpdLoadActivationStatus.failure):
    case getType(bpdUpsertIban.failure):
      return remoteError(action.payload);
  }
  return state;
};

const INITIAL_UPSERT: UpsertIBAN = {
  outcome: remoteUndefined,
  value: undefined
};

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
        value: action.payload.payoffInstr,
        outcome: remoteReady(action.payload.status)
      };
    case getType(bpdUpsertIban.failure):
      return {
        ...state,
        outcome: remoteError(action.payload)
      };
  }
  return state;
};

const paymentInstrumentReducer = combineReducers<PayoffInstrumentType, Action>({
  value: paymentInstrumentValueReducer,
  upsert: paymentInstrumentUpsertReducer
});

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

export default bpdActivationReducer;
