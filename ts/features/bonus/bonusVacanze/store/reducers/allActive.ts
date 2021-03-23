import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BonusActivationStatusEnum } from "../../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { Action } from "../../../../../store/actions/types";
import {
  profileSelector,
  ProfileState
} from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  activateBonusVacanze,
  loadAllBonusActivations,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";

export type AllActiveState = {
  [key: string]: pot.Pot<BonusActivationWithQrCode, Error>;
};
const INITIAL_STATE = {};
const reducer = (
  state: AllActiveState = INITIAL_STATE,
  action: Action
): AllActiveState => {
  switch (action.type) {
    // loading all active bonuses
    case getType(loadAllBonusActivations.request):
      // When we call `/activations` API the state needs to be cleaned up or the bonus will append when the payload changes
      return INITIAL_STATE;
    // bonus from id
    case getType(loadBonusVacanzeFromId.request):
      const cachedValue = state[action.payload];
      return {
        ...state,
        [action.payload]: cachedValue ? pot.toLoading(cachedValue) : pot.none
      };
    // a bonus is activated -> store it
    case getType(activateBonusVacanze.success):
      if (action.payload.activation === undefined) {
        return state;
      }
      return {
        ...state,
        [action.payload.activation.id]: pot.some(action.payload.activation)
      };
    case getType(loadBonusVacanzeFromId.success):
      return { ...state, [action.payload.id]: pot.some(action.payload) };
    case getType(loadBonusVacanzeFromId.failure):
      const cachedValueE = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]: pot.toError(cachedValueE, action.payload.error)
      };
  }
  return state;
};

// selectors

// return an object where the key is the id of the bonus and the value the bonus pot
export const allBonusActiveByIdSelector = (
  state: GlobalState
): AllActiveState => state.bonus.bonusVacanze.allActive;

// return an array of bonus active pots
export const allBonusActiveSelector = createSelector<
  GlobalState,
  AllActiveState,
  ReadonlyArray<pot.Pot<BonusActivationWithQrCode, Error>>
>(allBonusActiveByIdSelector, allActiveObj =>
  Object.keys(allActiveObj).map(k => allActiveObj[k])
);

// return the list of the active or redeemed bonus of which the current profile is the applicant
export const ownedActiveOrRedeemedBonus = createSelector<
  GlobalState,
  ReadonlyArray<pot.Pot<BonusActivationWithQrCode, Error>>,
  ProfileState,
  ReadonlyArray<BonusActivationWithQrCode>
>([allBonusActiveSelector, profileSelector], (allActiveArray, profile) =>
  pot.toOption(profile).fold([], p =>
    allActiveArray.reduce(
      (
        acc: ReadonlyArray<BonusActivationWithQrCode>,
        curr: pot.Pot<BonusActivationWithQrCode, Error>
      ) => {
        if (
          pot.isSome(curr) &&
          curr.value.applicant_fiscal_code === p.fiscal_code &&
          (curr.value.status === BonusActivationStatusEnum.ACTIVE ||
            curr.value.status === BonusActivationStatusEnum.REDEEMED)
        ) {
          return [...acc, curr.value];
        }
        return acc;
      },
      []
    )
  )
);

// return the bonus from a given ID
export const bonusActiveDetailByIdSelector = (id: string) =>
  createSelector<
    GlobalState,
    AllActiveState,
    pot.Pot<BonusActivationWithQrCode, Error>
  >(allBonusActiveByIdSelector, allActiveObj =>
    fromNullable(allActiveObj[id]).getOrElse(pot.none)
  );

export default reducer;
