import { combineReducers } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import { thirdPartyFromIdSelector } from "../../../../store/reducers/entities/messages/thirdPartyById";
import { toPNMessage } from "../types/transformers";
import { PnPreferences, pnPreferencesReducer } from "./preferences";

export type PnState = {
  preferences: PnPreferences;
};

export const pnReducer = combineReducers<PnState, Action>({
  preferences: pnPreferencesReducer
});

export const pnMessageFromIdSelector = createSelector(
  thirdPartyFromIdSelector,
  thirdPartyMessage => pot.map(thirdPartyMessage, _ => toPNMessage(_))
);
