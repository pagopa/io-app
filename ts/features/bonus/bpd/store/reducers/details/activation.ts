import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { loadBdpActivationStatus } from "../../actions/details";
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
    case getType(loadBdpActivationStatus.request):
    case getType(enrollToBpd.request):
      return remoteLoading;
    case getType(loadBdpActivationStatus.success):
    case getType(enrollToBpd.success):
      return remoteReady(action.payload.enabled);
    case getType(loadBdpActivationStatus.failure):
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
    case getType(loadBdpActivationStatus.request):
      return remoteLoading;
    case getType(loadBdpActivationStatus.success):
      return remoteReady(action.payload.payoffInstr);
    case getType(loadBdpActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

const bpdActivationReducer = combineReducers<BpdActivation, Action>({
  enabled: bpdActivationEnabledReducer,
  payoffInstr: bpdPaymentInstrumentReducer
});

export default bpdActivationReducer;
