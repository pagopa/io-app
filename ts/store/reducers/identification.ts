import { getType } from "typesafe-actions";

import { PinString } from "../../types/PinString";
import {
  identificationCancel,
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

export type IdentificationCancelData = {
  action: Action;
  label: string;
};

export type IdentificationSuccessData = {
  action: Action;
};

type IdentificationUnidentifiedState = {
  kind: "unidentified";
};

type IdentificationStartedState = {
  kind: "started";
  pin: PinString;
  identificationCancelData?: IdentificationCancelData;
  identificationSuccessData?: IdentificationSuccessData;
};

type IdentificationIdentifiedState = {
  kind: "identified";
};

export type IdentificationState =
  | IdentificationUnidentifiedState
  | IdentificationStartedState
  | IdentificationIdentifiedState;

export const INITIAL_STATE: IdentificationUnidentifiedState = {
  kind: "unidentified"
};

const reducer = (
  state: IdentificationState = INITIAL_STATE,
  action: Action
): IdentificationState => {
  switch (action.type) {
    case getType(identificationStart):
      return {
        kind: "started",
        ...action.payload
      };

    case getType(identificationCancel):
      return {
        kind: "unidentified"
      };

    case getType(identificationSuccess):
      return {
        kind: "identified"
      };

    case getType(identificationReset):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
