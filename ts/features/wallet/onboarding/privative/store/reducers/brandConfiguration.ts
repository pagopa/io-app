import * as pot from "italia-ts-commons/lib/pot";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { BrandId } from "./searchedPrivative";

export type BrandConfigurationState = pot.Pot<
  IndexedById<StatusEnum>,
  NetworkError
>;

// TODO: placeholder only, add missing logic
const brandConfigurationReducer = (
  state: BrandConfigurationState = pot.none,
  _: Action
): BrandConfigurationState => state;

export const privativeBrandConfigurationSelector = (
  state: GlobalState
): pot.Pot<IndexedById<StatusEnum>, NetworkError> =>
  state.wallet.onboarding.privative.brandConfiguration;

/**
 * Return the privative brand configuration for a specific brandId
 * @param state
 * @param brandId
 */
export const getPrivativeBrandConfigurationSelector = (
  state: GlobalState,
  brandId: BrandId
): pot.Pot<StatusEnum, NetworkError> =>
  pot.map(
    state.wallet.onboarding.privative.brandConfiguration,
    brandConfigById => brandConfigById[brandId] ?? StatusEnum.disabled
  );

export default brandConfigurationReducer;
