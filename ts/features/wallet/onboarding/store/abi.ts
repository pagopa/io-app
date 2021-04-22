import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { fromNullable } from "fp-ts/lib/Option";
import { IndexedById } from "../../../../store/helpers/indexer";
import { Abi } from "../../../../../definitions/pagopa/walletv2/Abi";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../store/actions/types";
import { loadAbi } from "../bancomat/store/actions";
import { GlobalState } from "../../../../store/reducers/types";
import { getBancomatAbiIconUrl } from "../../../../utils/paymentMethod";

// plain object where the key is the abi and the value is the abi object
export type AbiState = RemoteValue<IndexedById<Abi>, Error>;

const getIndexedAbi = (abis: ReadonlyArray<Abi>): IndexedById<Abi> =>
  abis.reduce(
    (acc: IndexedById<Abi>, curr: Abi) =>
      fromNullable(curr.abi).fold(acc, abi => ({
        ...acc,
        [abi]: curr
      })),
    {}
  );

const abiReducer = (
  state: AbiState = remoteUndefined,
  action: Action
): AbiState => {
  switch (action.type) {
    case getType(loadAbi.request):
      return remoteLoading;
    case getType(loadAbi.success):
      // since all fields are optional we ensure to index only entries those have abi defined
      const indexedAbi: IndexedById<Abi> = fromNullable(
        action.payload.data
      ).fold({}, getIndexedAbi);
      return remoteReady(indexedAbi);
    case getType(loadAbi.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default abiReducer;

const getAbiEnhanced = (indexedAbis: IndexedById<Abi>): IndexedById<Abi> => {
  const abis: ReadonlyArray<Abi | undefined> = Object.keys(indexedAbis).map<
    Abi | undefined
  >(k => indexedAbis[k]);
  return getIndexedAbi(
    abis.map(a => ({
      ...a,
      logoUrl: a?.abi && getBancomatAbiIconUrl(a.abi)
    }))
  );
};
/**
 * AbiState, memoized
 */
export const abiSelector = createSelector(
  [(state: GlobalState) => state.wallet.abi],
  (abis: AbiState): AbiState =>
    isReady(abis) ? remoteReady(getAbiEnhanced(abis.value)) : abis
);

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
