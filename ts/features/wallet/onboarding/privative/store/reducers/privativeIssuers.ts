import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { PrivativeServiceIssuer } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceIssuer";
import { PrivativeServiceStatus } from "../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceStatus";
import { contentRepoUrl } from "../../../../../../config";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById, toArray } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { loadPrivativeIssuers } from "../actions";
import { PrivativeIssuerId } from "./searchedPrivative";

// Replace string Id with a typed Id, in order to have a type check in the application domain
export type PrivativeIssuer = Omit<PrivativeServiceIssuer, "id"> & {
  id: PrivativeIssuerId;
  status: PrivativeServiceStatus;
  gdoLogo: string;
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
            [val.id]: {
              ...val,
              id: val.id as PrivativeIssuerId,
              status: serviceState,
              gdoLogo: `${contentRepoUrl}/logos/privative/gdo/${val.id}.png`
            }
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

export const privativeIssuersListSelector = createSelector(
  [privativeIssuersSelector],
  potPrivativeIssuers =>
    pot.map(potPrivativeIssuers, privativeIssuers =>
      toArray(privativeIssuers)
        .concat()
        .sort((v1, v2) => v1.gdo.localeCompare(v2.gdo))
    )
);

/**
 * Return the privative brand configuration for a specific brandId
 * @param state
 * @param privativeIssuerId
 */
export const getPrivativeIssuersSelector = (
  state: GlobalState,
  privativeIssuerId: PrivativeIssuerId
): pot.Pot<PrivativeIssuer | undefined, NetworkError> =>
  pot.map(
    state.wallet.onboarding.privative.privativeIssuers,
    issuersById => issuersById[privativeIssuerId]
  );

export default privativeIssuersReducer;
