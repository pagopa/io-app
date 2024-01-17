import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { cgnCodeFromBucket, cgnCodeFromBucketReset } from "../actions/bucket";
import { DiscountBucketCodeResponse } from "../../types/DiscountBucketCodeResponse";

export type CgnBucketState = {
  data: RemoteValue<DiscountBucketCodeResponse, NetworkError>;
};

const INITIAL_STATE: CgnBucketState = {
  data: remoteUndefined
};

const reducer = (
  state: CgnBucketState = INITIAL_STATE,
  action: Action
): CgnBucketState => {
  switch (action.type) {
    case getType(cgnCodeFromBucket.request):
      return {
        ...state,
        data: remoteLoading
      };
    case getType(cgnCodeFromBucket.success):
      return {
        ...state,
        data: remoteReady(action.payload)
      };
    case getType(cgnCodeFromBucket.failure):
      return {
        ...state,
        data: remoteError(action.payload)
      };
    case getType(cgnCodeFromBucketReset):
      return {
        ...INITIAL_STATE
      };
  }
  return state;
};

export default reducer;

export const cgnBucketSelector = (state: GlobalState): CgnBucketState["data"] =>
  state.bonus.cgn.bucket.data;
