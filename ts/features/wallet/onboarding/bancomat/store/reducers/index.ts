import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { fromNullable } from "fp-ts/lib/Option";
import { IndexedById } from "../../../../../../store/helpers/indexer";
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

// plain object where the key is the abi and the value is the abi object
export type AbiState = RemoteValue<IndexedById<Abi>, Error>;

const abiReducer = (
  state: AbiState = remoteUndefined,
  action: Action
): AbiState => {
  switch (action.type) {
    case getType(loadAbi.request):
      return remoteLoading;
    case getType(loadAbi.success):
      // since all fields are optional we ensure to index only entry those have abi defined
      const indexedAbi: IndexedById<Abi> = fromNullable(
        action.payload.data
      ).fold({}, abis =>
        abis.reduce(
          (acc: IndexedById<Abi>, curr: Abi) =>
            fromNullable(curr.abi).fold(acc, abi => ({
              ...acc,
              [abi]: curr
            })),
          {}
        )
      );
      return remoteReady(indexedAbi);
    case getType(loadAbi.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default abiReducer;

const abiSelector = (state: GlobalState): AbiState => state.wallet.abi;

// return the abi list as array
export const abiListSelector = createSelector<
  GlobalState,
  AbiState,
  ReadonlyArray<Abi>
>(abiSelector, abis =>
  isReady(abis)
    ? // build an array excluding the entry undefined
      Object.keys(abis.value).reduce(
        (acc: ReadonlyArray<Abi>, curr: string) =>
          fromNullable(abis.value[curr]).fold(acc, abi => [...acc, abi]),
        []
      )
    : []
);
