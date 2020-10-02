import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { fromNullable } from "fp-ts/lib/Option";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { Abi } from "../../../../../../../definitions/pagopa/bancomat/Abi";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../../../store/actions/types";
import { loadAbi } from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

// an plain object where the key is the abi and the value is the abi object
export type AbiState = RemoteValue<IndexedById<Abi>, Error>;

const abiReducer = (
  state: AbiState = remoteUndefined,
  action: Action
): AbiState => {
  switch (action.type) {
    case getType(loadAbi.request):
      return remoteLoading;
    case getType(loadAbi.success):
      // since all fields are optional empty string is used as fallback key
      return remoteReady(
        toIndexed(action.payload.data ?? [], a => a.abi ?? "")
      );
    case getType(loadAbi.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default abiReducer;

const abiSelector = (state: GlobalState): AbiState => state.wallet.abi;

// return the abi list as array
const abiListSelector = createSelector<
  GlobalState,
  AbiState,
  ReadonlyArray<Abi>
>(abiSelector, abis =>
  isReady(abis)
    ? Object.keys(abis.value).reduce(
        (acc: ReadonlyArray<Abi>, curr: string) =>
          fromNullable(abis.value[curr]).fold(acc, abi => [...acc, abi]),
        []
      )
    : []
);
