import { getType } from "typesafe-actions";

import * as O from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { pipe } from "fp-ts/lib/function";
import { PinString } from "../../types/PinString";
import {
  identificationCancel,
  identificationFailure,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../actions/identification";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

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
    timespanBetweenAttempts: newTimespan
  };
};

const reducer = (
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

    case getType(identificationFailure):
      const newErrorData = pipe(
        state.fail,
        O.fromNullable,
        O.fold(
          () => ({
            nextLegalAttempt: new Date(),
            remainingAttempts: maxAttempts - 1,
            timespanBetweenAttempts: 0
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

export default reducer;

// Selectors
export const identificationFailSelector = (state: GlobalState) =>
  O.fromNullable(state.identification.fail);

export const progressSelector = (state: GlobalState) =>
  state.identification.progress;
