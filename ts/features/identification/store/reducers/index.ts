import { getType } from "typesafe-actions";

import * as O from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { pipe } from "fp-ts/lib/function";
import { PinString } from "../../../../types/PinString";
import {
  identificationCancel,
  identificationFailure,
  identificationHideLockModal,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../actions";
import { Action } from "../../../../store/actions/types";

export const freeAttempts = 4;
// in seconds
export const deltaTimespanBetweenAttempts = 30;

export const maxAttempts = 8;

const maxDeltaTimespan =
  (maxAttempts - freeAttempts - 1) * deltaTimespanBetweenAttempts;

export enum IdentificationResult {
  "cancel" = "cancel",
  "pinreset" = "pinreset",
  "failure" = "failure",
  "success" = "success"
}

export enum IdentificationBackActionType {
  DEFAULT = "DEFAULT",
  CLOSE_APP = "CLOSE_APP"
}

export type IdentificationGenericData = {
  message: string;
};

export type IdentificationCancelData = { label: string; onCancel: () => void };

export type IdentificationSuccessData = { onSuccess: () => void };

type IdentificationUnidentifiedState = {
  kind: "unidentified";
};

type IdentificationStartedState = {
  kind: "started";
  pin: PinString;
  canResetPin: boolean;
  isValidatingTask: boolean; // it is true if the identification process is occurring to confirm a task (eg. a payment)
  identificationGenericData?: IdentificationGenericData;
  identificationCancelData?: IdentificationCancelData;
  identificationSuccessData?: IdentificationSuccessData;
  shufflePad?: boolean;
  identificationContext?: IdentificationBackActionType;
};

type IdentificationIdentifiedState = {
  kind: "identified";
};

export type IdentificationProgressState =
  | IdentificationUnidentifiedState
  | IdentificationStartedState
  | IdentificationIdentifiedState;

export type IdentificationFailData = {
  remainingAttempts: number;
  nextLegalAttempt: Date;
  timespanBetweenAttempts: number;
  showLockModal?: boolean;
};

export type IdentificationState = {
  progress: IdentificationProgressState;
  fail?: IdentificationFailData;
};

export type PersistedIdentificationState = IdentificationState & PersistPartial;

const INITIAL_PROGRESS_STATE: IdentificationUnidentifiedState = {
  kind: "unidentified"
};

export const INITIAL_STATE: IdentificationState = {
  progress: INITIAL_PROGRESS_STATE,
  fail: undefined
};

export const fillShowLockModal = (actualErrorData: IdentificationFailData) => {
  // showLockModal is true if the time gap between now and the next legal attempt
  // is less than the timespanBetweenAttempts and the remaining attempts are less than 3
  const timeGap =
    new Date().getTime() - actualErrorData.nextLegalAttempt.getTime();
  const showLockModal =
    actualErrorData.remainingAttempts <= 3 &&
    timeGap < actualErrorData.timespanBetweenAttempts * 1000;
  return {
    ...actualErrorData,
    showLockModal
  };
};

const nextErrorData = (
  errorData: IdentificationFailData
): IdentificationFailData => {
  // avoid overflow of remaining attempts
  const nextRemainingAttempts = Math.max(1, errorData.remainingAttempts - 1);

  const newTimespan =
    maxAttempts - nextRemainingAttempts > freeAttempts
      ? Math.min(
          maxDeltaTimespan,
          errorData.timespanBetweenAttempts + deltaTimespanBetweenAttempts
        )
      : 0;
  return {
    nextLegalAttempt: new Date(Date.now() + newTimespan * 1000),
    remainingAttempts: nextRemainingAttempts,
    timespanBetweenAttempts: newTimespan,
    showLockModal: nextRemainingAttempts <= 3
  };
};

export const identificationReducer = (
  state: IdentificationState = INITIAL_STATE,
  action: Action
): IdentificationState => {
  switch (action.type) {
    case getType(identificationStart):
      return {
        ...state,
        progress: {
          kind: "started",
          ...action.payload
        }
      };

    case getType(identificationCancel):
      return {
        progress: {
          kind: "unidentified"
        },
        fail: state.fail
      };

    case getType(identificationSuccess):
      return {
        progress: {
          kind: "identified"
        }
      };

    case getType(identificationReset):
      return INITIAL_STATE;

    case getType(identificationHideLockModal):
      const failData = state.fail
        ? {
            ...state.fail,
            showLockModal: false
          }
        : undefined;
      return {
        ...state,
        fail: failData
      };

    case getType(identificationFailure):
      const newErrorData = pipe(
        state.fail,
        O.fromNullable,
        O.fold(
          () => ({
            nextLegalAttempt: new Date(),
            remainingAttempts: maxAttempts - 1,
            timespanBetweenAttempts: 0,
            showLockModal: false
          }),
          errorData => nextErrorData(errorData)
        )
      );
      return {
        ...state,
        fail: newErrorData
      };

    default:
      return state;
  }
};
