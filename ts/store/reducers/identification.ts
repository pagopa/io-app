import { getType } from "typesafe-actions";

import { fromNullable } from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { PinString } from "../../types/PinString";
import {
  identificationCancel,
  identificationFailure,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../actions/identification";
import { Action } from "../actions/types";

export enum IdentificationResult {
  "cancel" = "cancel",
  "pinreset" = "pinreset",
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
  identificationGenericData?: IdentificationGenericData;
  identificationCancelData?: IdentificationCancelData;
  identificationSuccessData?: IdentificationSuccessData;
};

type IdentificationIdentifiedState = {
  kind: "identified";
};

export type IdentificationProgressState =
  | IdentificationUnidentifiedState
  | IdentificationStartedState
  | IdentificationIdentifiedState;

export type IdentificationFailData = {
  wrongAttempts: number;
  nextLegalAttempt: Date;
  timespanBetweenAttempts: number;
};

export type IdentificationState = {
  progress: IdentificationProgressState;
  fail?: IdentificationFailData;
};

export type PersistedIdentificationState = IdentificationState & PersistPartial;

const freeAttempts = 4;
// in seconds
const deltaTimespanBetweenAttempts = 1;

const maxAttempts = 8;

const INITIAL_PROGRESS_STATE: IdentificationUnidentifiedState = {
  kind: "unidentified"
};

const INITIAL_STATE: IdentificationState = {
  progress: INITIAL_PROGRESS_STATE,
  fail: undefined
};

const nextErrorData = (
  errorData: IdentificationFailData
): IdentificationFailData => {
  const newTimespan =
    errorData.wrongAttempts + 1 > freeAttempts
      ? errorData.timespanBetweenAttempts + deltaTimespanBetweenAttempts
      : 0;
  return {
    nextLegalAttempt: new Date(Date.now() + newTimespan * 1000),
    wrongAttempts: errorData.wrongAttempts + 1,
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
        }
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
      const newErrorData = fromNullable(state.fail).fold(
        {
          nextLegalAttempt: new Date(),
          wrongAttempts: 1,
          timespanBetweenAttempts: 0
        },
        errorData => nextErrorData(errorData)
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
