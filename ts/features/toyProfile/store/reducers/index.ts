import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { ToyProfileResponse } from "../../types";
import { getToyProfileDetailsAction } from "../actions";

export type ToyProfileState = pot.Pot<ToyProfileResponse, Error>; // forse era più corretto un RemoteValue, ma la traccia dice Pot

export const toyProfileReducer = (
  state: ToyProfileState = pot.none,
  action: any
): ToyProfileState => {
  switch (action.type) {
    case getType(getToyProfileDetailsAction.request):
      return pot.toLoading(state);
    case getType(getToyProfileDetailsAction.success):
      return pot.some(action.payload);
    case getType(getToyProfileDetailsAction.failure):
      return pot.toError(state, action.payload);
    default:
      return state;
  }
};
