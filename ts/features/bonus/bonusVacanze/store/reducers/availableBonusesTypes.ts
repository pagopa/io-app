import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
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
  ID_CGN_TYPE
} from "../../utils/bonus";
import { loadAvailableBonuses } from "../actions/bonusVacanze";
import {
  bonusVacanzeEnabled,
  bpdEnabled,
  cgnEnabled
} from "../../../../../config";
import { BonusVisibilityEnum } from "../../../../../../definitions/content/BonusVisibility";

export type AvailableBonusTypesState = pot.Pot<BonusesAvailable, Error>;

const INITIAL_STATE: AvailableBonusTypesState = pot.none;

const mapBonusIdFeatureFlag = new Map<number, boolean>([
  [ID_BONUS_VACANZE_TYPE, bonusVacanzeEnabled],
  [ID_BPD_TYPE, bpdEnabled],
  [ID_CGN_TYPE, cgnEnabled]
]);

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

// Selectors
const availableBonusTypesSelector = (
  state: GlobalState
): AvailableBonusTypesState => state.bonus.availableBonusTypes;

/**
 * return the bonuses that can be showed based on the 'visibility' bonus attribute.
 * if 'hidden' or unavailable bonus is hidden
 * if 'visible' bonus item is shown
 * if 'experimental' it visibility would depend on the related Feature Flag.
 */
export const visibleAvailableBonusSelector = createSelector(
  availableBonusTypesSelector,
  (availableBonusesState: AvailableBonusTypesState): BonusesAvailable =>
    pot.getOrElse(
      pot.map(availableBonusesState, bonuses =>
        bonuses.filter(b => {
          const isExperimentalEnabled =
            fromNullable(mapBonusIdFeatureFlag.get(b.id_type)).getOrElse(
              false
            ) && b.visibility === BonusVisibilityEnum.experimental;

          return (
            isExperimentalEnabled ||
            b.visibility === BonusVisibilityEnum.visible
          );
        })
      ),
      []
    )
);

// Returns true if information about Available Bonuses list is loading
export const isAvailableBonusLoadingSelector = createSelector(
  availableBonusTypesSelector,
  (abs: AvailableBonusTypesState) => pot.isLoading(abs)
);

// Returns true if information about Available Bonuses list is in error
export const isAvailableBonusErrorSelector = createSelector(
  availableBonusTypesSelector,
  (abs: AvailableBonusTypesState): boolean => pot.isError(abs)
);

// Returns true if information about Available Bonuses list
// is in error state and no data is available in list (NoneError type)
export const isAvailableBonusNoneErrorSelector = createSelector(
  [availableBonusTypesSelector, isAvailableBonusErrorSelector],
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
  >(availableBonusTypesSelector, ab =>
    pot.getOrElse(
      pot.map(ab, abs => abs.find(i => i.id_type === idBonusType)),
      undefined
    )
  );
/**
 * Return the uri of the bonus vacanze image logo
 */
export const bonusVacanzeLogo = createSelector(
  availableBonusTypesSelectorFromId(ID_BONUS_VACANZE_TYPE),
  bonus => fromNullable(bonus).fold(undefined, b => b.cover)
);

export default reducer;
