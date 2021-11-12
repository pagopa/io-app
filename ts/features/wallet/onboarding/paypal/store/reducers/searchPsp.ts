import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { NetworkError } from "../../../../../../utils/errors";
import { IOPayPalPsp } from "../../types";
import { Action } from "../../../../../../store/actions/types";
import { searchPaypalPsp } from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

export type RemotePayPalPsp = RemoteValue<
  ReadonlyArray<IOPayPalPsp>,
  NetworkError
>;

const payPalPspReducer = (
  state: RemotePayPalPsp = remoteUndefined,
  action: Action
): RemotePayPalPsp => {
  switch (action.type) {
    case getType(searchPaypalPsp.request):
      return remoteLoading;
    case getType(searchPaypalPsp.success):
      return remoteReady(action.payload);
    case getType(searchPaypalPsp.failure):
      return remoteError(action.payload);
    default:
      return state;
  }
};

export const payPalPspSelector = (state: GlobalState) =>
  state.wallet.onboarding.paypal.psp;

export default payPalPspReducer;
