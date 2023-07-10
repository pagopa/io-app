import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BonusAvailable } from "../../../../../../definitions/content/BonusAvailable";
import { BonusesAvailable } from "../../../../../../definitions/content/BonusesAvailable";
import { clearCache } from "../../../../../store/actions/profile";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  ID_BONUS_VACANZE_TYPE,
  ID_BPD_TYPE,
  mapBonusIdFeatureFlag
} from "../../utils/bonus";
import { loadAvailableBonuses } from "../actions/bonusVacanze";

import { BonusVisibilityEnum } from "../../../../../../definitions/content/BonusVisibility";
import { servicesByIdSelector } from "../../../../../store/reducers/entities/services/servicesById";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";

export type AvailableBonusTypesState = pot.Pot<BonusesAvailable, Error>;

const INITIAL_STATE: AvailableBonusTypesState = pot.none;

const reducer = (
  state: AvailableBonusTypesState = INITIAL_STATE,
  action: Action
): AvailableBonusTypesState => {
  switch (action.type) {
    // available bonuses
    case getType(loadAvailableBonuses.request):
      return pot.toLoading(state);
    case getType(loadAvailableBonuses.success):
      return pot.some(action.payload);
    case getType(loadAvailableBonuses.failure):
      return pot.toError(state, action.payload);
    case getType(clearCache):
      return INITIAL_STATE;
  }
  return state;
};

/**
 * return all available bonus: visibile, hidden or experimental
 */
export const allAvailableBonusTypesSelector = (
  state: GlobalState
): AvailableBonusTypesState => state.bonus.availableBonusTypes;

export const experimentalAndVisibleBonus = (bonus: BonusAvailable): boolean =>
  [BonusVisibilityEnum.experimental, BonusVisibilityEnum.visible].some(
    v => v === bonus.visibility
  );
/**
 * return only these bonus the app supports: a bonus is supported when the relative feature flag
 * exists and it is ON and the relative available bonus is in state 'visible' or 'experimental'
 */
export const supportedAvailableBonusSelector = createSelector(
  allAvailableBonusTypesSelector,
  (availableBonusesState: AvailableBonusTypesState): BonusesAvailable =>
    pot.getOrElse(
      pot.map(availableBonusesState, bonuses =>
        bonuses.filter(b => {
          const isFeatureFlagEnabled = pipe(
            mapBonusIdFeatureFlag().get(b.id_type),
            O.fromNullable,
            O.getOrElse(() => false)
          );
          return (
            b.id_type !== ID_BPD_TYPE &&
            isFeatureFlagEnabled &&
            experimentalAndVisibleBonus(b)
          );
        })
      ),
      []
    )
);

// Returns true if information about Available Bonuses list is loading
export const isAvailableBonusLoadingSelector = createSelector(
  allAvailableBonusTypesSelector,
  (abs: AvailableBonusTypesState): boolean => pot.isLoading(abs)
);

// Returns true if information about Available Bonuses list is in error
export const isAvailableBonusErrorSelector = createSelector(
  allAvailableBonusTypesSelector,
  (abs: AvailableBonusTypesState): boolean => pot.isError(abs)
);

// Returns true if information about Available Bonuses list
// is in error state and no data is available in list (NoneError type)
export const isAvailableBonusNoneErrorSelector = createSelector(
  [allAvailableBonusTypesSelector, isAvailableBonusErrorSelector],
  (abs: AvailableBonusTypesState, hasError: boolean): boolean =>
    hasError && pot.isNone(abs)
);

/**
 * return the bonus type corresponding to the given idBonusType
 * @param idBonusType
 */
export const availableBonusTypesSelectorFromId = (idBonusType: number) =>
  createSelector<
    GlobalState,
    AvailableBonusTypesState,
    BonusAvailable | undefined
  >(allAvailableBonusTypesSelector, ab =>
    pot.getOrElse(
      pot.map(ab, abs => abs.find(i => i.id_type === idBonusType)),
      undefined
    )
  );

export const serviceFromAvailableBonusSelector = (idBonusType: number) =>
  createSelector(
    supportedAvailableBonusSelector,
    servicesByIdSelector,
    (supportedBonus, servicesById): O.Option<ServicePublic> =>
      pipe(
        supportedBonus.find(sp => sp.id_type === idBonusType),
        O.fromNullable,
        O.chainNullableK(bonus =>
          bonus.service_id ? servicesById[bonus.service_id] : undefined
        ),
        O.chainNullableK(pot.toUndefined)
      )
  );

/**
 * Return the uri of the bonus vacanze image logo
 */
export const bonusVacanzeLogo = createSelector(
  availableBonusTypesSelectorFromId(ID_BONUS_VACANZE_TYPE),
  bonus =>
    pipe(
      bonus,
      O.fromNullable,
      O.fold(
        () => undefined,
        b => b.cover
      )
    )
);

export default reducer;
