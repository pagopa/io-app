import React from "react";
import { SubscriptionStateEnum } from "../../../../definitions/trial_systwem/SubscriptionState";
import { TrialId } from "../../../../definitions/trial_systwem/TrialId";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusReset,
  trialSystemActivationStatusUpsert
} from "../store/actions";
import {
  isLoadingTrialStatusSelector,
  trialStatusSelector
} from "../store/reducers";

export type UseTrialStatus = {
  /** The current status of the trial */
  status: SubscriptionStateEnum | undefined;
  /** Indicates whether the trial status is currently being loaded */
  isLoading: boolean;
  /** Indicates whether the trial status is currently being updated */
  isUpdating: boolean;
  /** Function to subscribe to the trial system */
  subscribe: () => void;
  /** Function to manually refresh the trial status */
  refresh: () => void;
  /** Function to reset the trial status */
  reset: () => void;
};

/**
 * Custom hook that manages the trial status of a system/feature, providing functionalities to refresh and reset the
 * status, as well as selectors for the current status and loading states
 * @param trialId The unique identifier for the trial system
 * @returns
 */
export const useTrialSystemStatus = (trialId: TrialId): UseTrialStatus => {
  const dispatch = useIODispatch();
  const status = useIOSelector(trialStatusSelector(trialId));
  const isLoading = useIOSelector(isLoadingTrialStatusSelector(trialId));
  const isUpdating = useIOSelector(isLoadingTrialStatusSelector(trialId));

  const subscribe = React.useCallback(() => {
    dispatch(trialSystemActivationStatusUpsert.request(trialId));
  }, [dispatch, trialId]);

  const refresh = React.useCallback(() => {
    dispatch(trialSystemActivationStatus.request(trialId));
  }, [dispatch, trialId]);

  const reset = React.useCallback(() => {
    dispatch(trialSystemActivationStatusReset(trialId));
  }, [dispatch, trialId]);

  return {
    status,
    isLoading,
    isUpdating,
    subscribe,
    refresh,
    reset
  };
};
