import { getType } from "typesafe-actions";
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
import { createSelector } from "reselect";

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
      // since all fields are optional empty string the fallback key
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

const abiListSelect = createSelector<
  GlobalState,
  AbiState,
  ReadonlyArray<Abi | undefined>
>(abiSelector, abis =>
  isReady(abis)
    ? Object.keys(abis.value)
        .map(a => abis.value[a])
        .filter(a => a !== undefined)
    : []
);
