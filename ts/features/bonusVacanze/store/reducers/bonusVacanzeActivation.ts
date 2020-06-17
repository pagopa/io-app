import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BonusActivationStatusEnum } from "../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  bonusVacanzeActivation,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

export enum BonusActivationProgressEnum {
  "ELIGIBILITY_EXPIRED" = "ELIGIBILITY_EXPIRED", // Cannot activate a new bonus because the eligibility data has expired.
  "UNDEFINED" = "UNDEFINED",
  "PROGRESS" = "PROGRESS", // The request is started
  "TIMEOUT" = "TIMEOUT", // Polling time exceeded
  "ERROR" = "ERROR", // The request is started
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "SUCCESS" = "SUCCESS" // Activation has been completed
}

// type alias
type BonusVacanzeActivationState = {
  status: BonusActivationProgressEnum;
  activation: pot.Pot<BonusActivationWithQrCode, Error>;
};

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  eligibility: EligibilityState;
  bonusVacanze: BonusVacanzeActivationState;
}>;

const INITIAL_STATE: BonusVacanzeActivationState = {
  status: BonusActivationProgressEnum.UNDEFINED,
  activation: pot.none
};

// bonus reducer
export const bonusVacanzeActivationReducer = (
  state: BonusVacanzeActivationState = INITIAL_STATE,
  action: Action
): BonusVacanzeActivationState => {
  switch (action.type) {
    // bonus from id
    case getType(loadBonusVacanzeFromId.request):
      return { ...state, activation: pot.toLoading(state.activation) };
    case getType(loadBonusVacanzeFromId.success):
      return { ...state, activation: pot.some(action.payload) };
    case getType(loadBonusVacanzeFromId.failure):
      return {
        ...state,
        activation: pot.toError(state.activation, action.payload)
      };
    // bonus activation
    case getType(bonusVacanzeActivation.request):
      return {
        ...state,
        status: BonusActivationProgressEnum.PROGRESS,
        activation: pot.toLoading(state.activation)
      };
    case getType(bonusVacanzeActivation.success):
      return {
        ...state,
        status: action.payload.status,
        activation: action.payload.activation
          ? pot.some(action.payload.activation)
          : pot.none
      };
    case getType(bonusVacanzeActivation.failure):
      return {
        ...state,
        status: BonusActivationProgressEnum.ERROR,
        activation: pot.toError(state.activation, action.payload)
      };
  }
  return state;
};

const reducer = combineReducers<BonusState, Action>({
  availableBonuses: availableBonusesReducer,
  eligibility: eligibilityReducer,
  bonusVacanze: bonusVacanzeActivationReducer
});

// Selectors
// return the bonus vacanze activation pot
export const bonusVacanzeActivationSelector = (
  state: GlobalState
): pot.Pot<BonusActivationWithQrCode, Error> =>
  state.bonus.bonusVacanze.activation;

// return the bonus activation if it is in ACTIVE state
export const bonusVacanzeActivationActiveSelector = createSelector<
  GlobalState,
  pot.Pot<BonusActivationWithQrCode, Error>,
  pot.Pot<BonusActivationWithQrCode, Error>
>(bonusVacanzeActivationSelector, bv =>
  pot.filter(bv, v => v.status === BonusActivationStatusEnum.ACTIVE)
);

/* return true if a bonus vacanze
* - doesn't exists (pot.none)
* - exists but its state is VOIDED or FAILED
*/
export const canBonusVacanzeBeRequestedSelector = createSelector<
  GlobalState,
  pot.Pot<BonusActivationWithQrCode, Error>,
  boolean
>(bonusVacanzeActivationSelector, bv => {
  return pot.getOrElse(
    pot.map(bv, v => v.status === BonusActivationStatusEnum.FAILED),
    true
  );
});

// return true if there is a bonus vacanze and its state is active
export const isBonusVacanzeActiveSelector = createSelector<
  GlobalState,
  pot.Pot<BonusActivationWithQrCode, Error>,
  boolean
>(bonusVacanzeActivationSelector, bv => {
  return pot.getOrElse(
    pot.map(bv, v => v.status === BonusActivationStatusEnum.ACTIVE),
    false
  );
});

export default reducer;
