import { getType } from "typesafe-actions";
import { combineReducers } from "redux";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import { Action } from "../../../../../../../store/actions/types";
import { optInPaymentMethodsShowChoice } from "../../../actions/optInPaymentMethods";
import { GlobalState } from "../../../../../../../store/reducers/types";

export type ShowOptInChoice = RemoteValue<boolean, Error>;
export type BpdActivationUiState = {
  showOptInChoice: ShowOptInChoice;
};

const SHOW_OPT_IN_CHOICE_INITIAL_STATE: ShowOptInChoice = remoteUndefined;
const showOptInChoiceReducer = (
  state: ShowOptInChoice = SHOW_OPT_IN_CHOICE_INITIAL_STATE,
  action: Action
): ShowOptInChoice => {
  switch (action.type) {
    case getType(optInPaymentMethodsShowChoice.request):
      return remoteLoading;
    case getType(optInPaymentMethodsShowChoice.success):
      return remoteReady(action.payload);
    case getType(optInPaymentMethodsShowChoice.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const bpdActivationUiReducer = combineReducers<
  BpdActivationUiState,
  Action
>({
  showOptInChoice: showOptInChoiceReducer
});

/**
 * Return the optInStatus value related to the bpd program
 * @param state
 */
export const showOptInChoiceSelector = (state: GlobalState): ShowOptInChoice =>
  state.bonus.bpd.details.activation.ui.showOptInChoice;
