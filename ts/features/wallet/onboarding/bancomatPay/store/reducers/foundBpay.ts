import { getType } from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  isError,
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserBPay } from "../actions";

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

/**
 * Return {@link RemoteBPay}, a list of BPay accounts to be viewed by the user.
 * Remove from the list the disabled accounts
 * @param state
 */
export const onboardingBPayFoundAccountsSelector = (
  state: GlobalState
): RemoteBPay =>
  isReady(state.wallet.onboarding.bPay.foundBPay)
    ? remoteReady(
        state.wallet.onboarding.bPay.foundBPay.value.filter(
          // Remove from the found accounts the disabled (serviceState === "DIS")
          bPay => bPay.serviceState !== "DIS"
        )
      )
    : state.wallet.onboarding.bPay.foundBPay;

/**
 * The search BPay account APi have an error
 * @param state
 */
export const onboardingBpayFoundAccountsIsError = (
  state: GlobalState
): boolean => isError(state.wallet.onboarding.bPay.foundBPay);

export default foundBpayReducer;
