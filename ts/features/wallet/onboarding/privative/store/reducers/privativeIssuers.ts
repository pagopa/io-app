import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { PrivativeServiceIssuer } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceIssuer";
import { PrivativeServiceStatus } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceStatus";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { loadPrivativeIssuers } from "../actions";
import { BrandId } from "./searchedPrivative";

type PrivativeIssuer = PrivativeServiceIssuer & {
  status: PrivativeServiceStatus;
};

export type PrivativeIssuersState = pot.Pot<
  IndexedById<PrivativeIssuer>,
  NetworkError
>;

const privativeIssuersReducer = (
  state: PrivativeIssuersState = pot.none,
  action: Action
): PrivativeIssuersState => {
  switch (action.type) {
    case getType(loadPrivativeIssuers.request):
      return pot.toLoading(state);
    case getType(loadPrivativeIssuers.success):
      const abiConfiguration = Object.keys(action.payload).reduce<
        IndexedById<PrivativeIssuer>
      >((acc, val) => {
        // foreach service, generate the mapping abi: state
        const serviceState = action.payload[val].status;
        const serviceAbiWithConfiguration = action.payload[val].issuers.reduce<
          IndexedById<PrivativeIssuer>
        >(
          (acc, val) => ({
            ...acc,
            [val.id]: { ...val, status: serviceState }
          }),
          {}
        );
        // return a flat IndexedById<PrivativeIssuer>
        return { ...acc, ...serviceAbiWithConfiguration };
      }, {});
      return pot.some(abiConfiguration);
    case getType(loadPrivativeIssuers.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export const privativeIssuersSelector = (
  state: GlobalState
): pot.Pot<IndexedById<PrivativeIssuer>, NetworkError> =>
  state.wallet.onboarding.privative.privativeIssuers;

/**
 * Return the privative brand configuration for a specific brandId
 * @param state
 * @param brandId
 */
export const getPrivativeIssuersSelector = (
  state: GlobalState,
  brandId: BrandId
): pot.Pot<PrivativeIssuer | undefined, NetworkError> =>
  pot.map(
    state.wallet.onboarding.privative.privativeIssuers,
    issuersById => issuersById[brandId]
  );

export default privativeIssuersReducer;
