import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  SubscriptionState,
  SubscriptionStateEnum
} from "../../../../../definitions/trial_system/SubscriptionState";
import { TrialId } from "../../../../../definitions/trial_system/TrialId";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { TrialSystemError } from "../../utils/error";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusReset,
  trialSystemActivationStatusUpsert
} from "../actions";

export type TrialSystemState = Record<
  TrialId,
  pot.Pot<SubscriptionState, TrialSystemError>
>;

const initialState: TrialSystemState = {};

/**
 * Store the activation state of the Trial System
 * @param state
 * @param action
 */
export const trialSystemActivationStatusReducer = (
  state: TrialSystemState = initialState,
  action: Action
): TrialSystemState => {
  switch (action.type) {
    case getType(trialSystemActivationStatus.request):
      return {
        ...state,
        [action.payload]: pot.toLoading(state[action.payload] ?? pot.none)
      };
    case getType(trialSystemActivationStatusUpsert.success):
    case getType(trialSystemActivationStatus.success):
      return {
        ...state,
        [action.payload.trialId]: pot.some(action.payload.state)
      };
    case getType(trialSystemActivationStatusReset):
      return {
        ...state,
        [action.payload]: pot.none
      };
    case getType(trialSystemActivationStatusUpsert.failure):
    case getType(trialSystemActivationStatus.failure):
      return {
        ...state,
        [action.payload.trialId]: pot.toError(
          state[action.payload.trialId] ?? pot.none,
          action.payload.error
        )
      };
    case getType(trialSystemActivationStatusUpsert.request):
      return {
        ...state,
        [action.payload]: pot.toUpdating(
          state[action.payload] ?? pot.none,
          isStateActive(state[action.payload])
            ? SubscriptionStateEnum.UNSUBSCRIBED
            : SubscriptionStateEnum.SUBSCRIBED
        )
      };
    default:
      return state;
  }
};

const isStateActive = (status: pot.Pot<SubscriptionState, Error> | undefined) =>
  status &&
  pot.isSome(status) &&
  (status.value === SubscriptionStateEnum.ACTIVE ||
    status.value === SubscriptionStateEnum.SUBSCRIBED);

export const trialSystemActivationStatusSelector = (
  state: GlobalState
): TrialSystemState => state.trialSystem;

export const trialStatusSelector = (id: TrialId) => (state: GlobalState) =>
  pipe(
    state,
    trialSystemActivationStatusSelector,
    status => status[id] ?? pot.none,
    pot.toUndefined
  );

export const isLoadingTrialStatusSelector =
  (id: TrialId) => (state: GlobalState) =>
    pipe(
      state,
      trialSystemActivationStatusSelector,
      status => status[id] ?? pot.none,
      pot.isLoading
    );

export const isUpdatingTrialStatusSelector =
  (id: TrialId) => (state: GlobalState) =>
    pipe(
      state,
      trialSystemActivationStatusSelector,
      status => status[id] ?? pot.none,
      pot.isUpdating
    );

/**
 * Returns the pot state of a given trial
 * @param id - The trial id
 * @returns the pot state of the trial
 */
export const trialStatusPotSelector = (id: TrialId) => (state: GlobalState) =>
  pipe(
    state,
    trialSystemActivationStatusSelector,
    status => status[id] ?? pot.none
  );

/**
 * Allows to know if the user has the access to the specified trial
 */
export const isTrialActiveSelector = (id: TrialId) =>
  createSelector(
    trialStatusSelector(id),
    status => status === SubscriptionStateEnum.ACTIVE
  );
