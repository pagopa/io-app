import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { Otp } from "../../../../../../definitions/cgn/Otp";
import { cngGenerateOtp } from "../actions/otp";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";

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
    case getType(cngGenerateOtp.request):
      return {
        ...state,
        data: remoteLoading
      };
    case getType(cngGenerateOtp.success):
      return {
        ...state,
        data: remoteReady(action.payload)
      };
    case getType(cngGenerateOtp.failure):
      return {
        ...state,
        data: remoteError(action.payload)
      };
  }
  return state;
};

export default reducer;

export const cgnOtpDataSelector = (state: GlobalState): CgnOtpState["data"] =>
  state.bonus.cgn.otp.data;
