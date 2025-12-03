import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { testAarCreateMandate } from "../actions";
import {
  getValue,
  isLoading,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { GlobalState } from "../../../../../store/reducers/types";
import { MandateCreationResponse } from "../../../../../../definitions/pn/aar/MandateCreationResponse";

export type TempAarMandateState = {
  mandate: RemoteValue<MandateCreationResponse, string>;
};

export const INITIAL_TEMP_AAR_MANDATE_STATE: TempAarMandateState = {
  mandate: remoteUndefined
};

export const tempAarMandateReducer = (
  state: TempAarMandateState = INITIAL_TEMP_AAR_MANDATE_STATE,
  action: Action
): TempAarMandateState => {
  switch (action.type) {
    case getType(testAarCreateMandate.request):
      return {
        mandate: remoteLoading
      };
    case getType(testAarCreateMandate.success):
      return {
        mandate: remoteReady(action.payload)
      };
    case getType(testAarCreateMandate.failure):
      return {
        mandate: remoteError(action.payload)
      };
    case getType(testAarCreateMandate.cancel):
      return {
        mandate: remoteUndefined
      };
  }
  return state;
};

export const isRequestingSendMandateSelector = (state: GlobalState) =>
  isLoading(state.features.pn.tempAarMandate.mandate);
export const sendVerificationCodeSelector = (state: GlobalState) =>
  getValue(state.features.pn.tempAarMandate.mandate)?.mandate.verificationCode;
