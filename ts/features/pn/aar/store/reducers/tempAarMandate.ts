import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  testAarAcceptMandate,
  testAarClearData,
  testAarCreateMandate
} from "../actions";
import {
  getValue,
  isError,
  isLoading,
  isReady,
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
  validation: RemoteValue<void, string>;
};

export const INITIAL_TEMP_AAR_MANDATE_STATE: TempAarMandateState = {
  mandate: remoteUndefined,
  validation: remoteUndefined
};

export const tempAarMandateReducer = (
  state: TempAarMandateState = INITIAL_TEMP_AAR_MANDATE_STATE,
  action: Action
): TempAarMandateState => {
  switch (action.type) {
    case getType(testAarCreateMandate.request):
      return {
        mandate: remoteLoading,
        validation: remoteUndefined
      };
    case getType(testAarCreateMandate.success):
      return {
        mandate: remoteReady(action.payload),
        validation: remoteUndefined
      };
    case getType(testAarCreateMandate.failure):
      return {
        mandate: remoteError(action.payload),
        validation: remoteUndefined
      };
    case getType(testAarAcceptMandate.request):
      return {
        ...state,
        validation: remoteLoading
      };
    case getType(testAarAcceptMandate.success):
      return {
        ...state,
        validation: remoteReady(undefined)
      };
    case getType(testAarAcceptMandate.failure):
      return {
        ...state,
        validation: remoteError(action.payload)
      };
    case getType(testAarClearData): {
      return INITIAL_TEMP_AAR_MANDATE_STATE;
    }
  }
  return state;
};

export const sendMandateErrorSelector = (state: GlobalState) => {
  const mandate = state.features.pn.tempAarMandate.mandate;
  if (isError(mandate)) {
    return mandate.error;
  }
  return undefined;
};
export const sendValidationErrorSelector = (state: GlobalState) => {
  const mandate = state.features.pn.tempAarMandate.mandate;
  if (!isReady(mandate)) {
    return undefined;
  }
  const validation = state.features.pn.tempAarMandate.validation;
  if (isError(validation)) {
    return validation.error;
  }
  return undefined;
};

export const isRequestingSendMandateSelector = (state: GlobalState) =>
  isLoading(state.features.pn.tempAarMandate.mandate);
export const sendVerificationCodeSelector = (state: GlobalState) =>
  getValue(state.features.pn.tempAarMandate.mandate)?.mandate.verificationCode;
export const sendMandateIdSelector = (state: GlobalState) =>
  getValue(state.features.pn.tempAarMandate.mandate)?.mandate.mandateId;
export const hasSendMandateSelector = (state: GlobalState) => {
  const mandate = getValue(state.features.pn.tempAarMandate.mandate)?.mandate;
  return mandate?.mandateId != null && mandate?.verificationCode != null;
};
export const sendValidationStatusSelector = (state: GlobalState) => {
  if (!hasSendMandateSelector(state)) {
    return undefined;
  }
  const validation = state.features.pn.tempAarMandate.validation;
  if (isReady(validation)) {
    return "succeeded";
  } else if (isError(validation)) {
    return "failed";
  }
  return undefined;
};
