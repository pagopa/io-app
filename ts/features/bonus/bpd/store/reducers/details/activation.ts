import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { loadBpdActivationStatus } from "../../actions/details";
import { enrollToBpd } from "../../actions/onboarding";

export type BpdActivation = {
  enabled: RemoteValue<boolean, Error>;
  payoffInstr: RemoteValue<string | undefined, Error>;
  // TODO: use definitions/backend/Iban.ts ?
};

const bpdActivationEnabledReducer = (
  state: RemoteValue<boolean, Error> = remoteUndefined,
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(loadBpdActivationStatus.request):
    case getType(enrollToBpd.request):
      return remoteLoading;
    case getType(loadBpdActivationStatus.success):
    case getType(enrollToBpd.success):
      return remoteReady(action.payload.enabled);
    case getType(loadBpdActivationStatus.failure):
    case getType(enrollToBpd.failure):
      return remoteError(action.payload);
  }
  return state;
};

// TODO: integrate with edit / insert iban call
const bpdPaymentInstrumentReducer = (
  state: RemoteValue<string | undefined, Error> = remoteUndefined,
  action: Action
): RemoteValue<string | undefined, Error> => {
  switch (action.type) {
    case getType(loadBpdActivationStatus.request):
      return remoteLoading;
    case getType(loadBpdActivationStatus.success):
      return remoteReady(action.payload.payoffInstr);
    case getType(loadBpdActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

const bpdActivationReducer = combineReducers<BpdActivation, Action>({
  enabled: bpdActivationEnabledReducer,
  payoffInstr: bpdPaymentInstrumentReducer
});

export const bpdEnabledSelector = (
  state: GlobalState
): RemoteValue<boolean, Error> => state.bonus.bpd.details.activation.enabled;

export default bpdActivationReducer;
