import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { Otp } from "../../../../../../definitions/cgn/Otp";
import { cgnGenerateOtp, resetOtpState } from "../actions/otp";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";

export type CgnOtpState = {
  data: RemoteValue<Otp, NetworkError>;
};

const INITIAL_STATE: CgnOtpState = {
  data: remoteUndefined
};

const reducer = (
  state: CgnOtpState = INITIAL_STATE,
  action: Action
): CgnOtpState => {
  switch (action.type) {
    case getType(cgnGenerateOtp.request):
      return {
        ...state,
        data: remoteLoading
      };
    case getType(cgnGenerateOtp.success):
      return {
        ...state,
        data: remoteReady(action.payload)
      };
    case getType(cgnGenerateOtp.failure):
      return {
        ...state,
        data: remoteError(action.payload)
      };
    case getType(resetOtpState):
      return {
        ...INITIAL_STATE
      };
  }
  return state;
};

export default reducer;

export const cgnOtpDataSelector = (state: GlobalState): CgnOtpState["data"] =>
  state.bonus.cgn.otp.data;
