import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { BonusAvailable } from "../../../../../../definitions/content/BonusAvailable";
import { BonusesAvailable } from "../../../../../../definitions/content/BonusesAvailable";
import { GlobalState } from "../../../../../store/reducers/types";

import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { BonusVisibilityEnum } from "../../../../../../definitions/content/BonusVisibility";
import { servicesByIdSelector } from "../../../../../store/reducers/entities/services/servicesById";
import { mapBonusIdFeatureFlag } from "../../utils";
import { AvailableBonusTypesState } from "../reducers/availableBonusesTypes";

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
          return isFeatureFlagEnabled && experimentalAndVisibleBonus(b);
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
