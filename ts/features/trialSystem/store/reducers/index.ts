import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { TrialId } from "../../../../../definitions/trial_systwem/TrialId";
import {
  SubscriptionState,
  SubscriptionStateEnum
} from "../../../../../definitions/trial_systwem/SubscriptionState";
import { Action } from "../../../../store/actions/types";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusReset,
  trialSystemActivationStatusUpsert
} from "../actions";
import { GlobalState } from "../../../../store/reducers/types";

export type TrialSystemState = Record<
  TrialId,
  pot.Pot<SubscriptionState, Error>
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
