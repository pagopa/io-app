import { getType } from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserBPay } from "../actions";
import { NetworkError } from "../../../../../../utils/errors";

export type RemoteBPay = RemoteValue<ReadonlyArray<BPay>, NetworkError>;

const foundBpayReducer = (
  state: RemoteBPay = remoteUndefined,
  action: Action
): RemoteBPay => {
  switch (action.type) {
    case getType(searchUserBPay.request):
      return remoteLoading;
    case getType(searchUserBPay.success):
      return remoteReady(action.payload);
    case getType(searchUserBPay.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const onboardingBPayFoundAccountsSelector = (
  state: GlobalState
): RemoteBPay => state.wallet.onboarding.bPay.foundBPay;

export const onboardingBpayFoundAccountsIsError = (
  state: GlobalState
): boolean => isError(state.wallet.onboarding.bPay.foundBPay);

export default foundBpayReducer;
