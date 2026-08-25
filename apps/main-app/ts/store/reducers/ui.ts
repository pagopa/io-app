/**
 * A reducer for ephemeral, not persisted UI state that is shared across
 * screens and triggered by state machines instead of navigation params.
 */
import { isActionOf } from "typesafe-actions";

import { MixPanelCredential } from "../../features/itwallet/analytics/utils/types";
import { EidActivationExitStep } from "../../features/itwallet/common/hooks/useItwActivationExitSurveyBottomSheet.tsx";
import { CredentialExitStep } from "../../features/itwallet/common/hooks/useItwCredentialExitSurveyBottomSheet.tsx";
import { Action } from "../actions/types";
import {
  uiHideActivationExitSurvey,
  uiHideCredentialExitSurvey,
  uiHideItwFeedbackBottomSheet,
  uiShowActivationExitSurvey,
  uiShowCredentialExitSurvey,
  uiShowItwFeedbackBottomSheet
} from "../actions/ui";
import { GlobalState } from "./types";

export type UiState = Readonly<{
  activationExitSurvey: undefined | { step: EidActivationExitStep };
  credentialExitSurvey:
    | undefined
    | { credential: MixPanelCredential; step: CredentialExitStep };
  itwFeedbackBottomSheet: boolean;
}>;

const initialUiState: UiState = {
  itwFeedbackBottomSheet: false,
  activationExitSurvey: undefined,
  credentialExitSurvey: undefined
};

export default function uiReducer(
  state: UiState = initialUiState,
  action: Action
): UiState {
  if (isActionOf(uiShowItwFeedbackBottomSheet, action)) {
    return { ...state, itwFeedbackBottomSheet: true };
  }
  if (isActionOf(uiHideItwFeedbackBottomSheet, action)) {
    return { ...state, itwFeedbackBottomSheet: false };
  }
  if (isActionOf(uiShowActivationExitSurvey, action)) {
    return { ...state, activationExitSurvey: action.payload };
  }
  if (isActionOf(uiHideActivationExitSurvey, action)) {
    return { ...state, activationExitSurvey: undefined };
  }
  if (isActionOf(uiShowCredentialExitSurvey, action)) {
    return { ...state, credentialExitSurvey: action.payload };
  }
  if (isActionOf(uiHideCredentialExitSurvey, action)) {
    return { ...state, credentialExitSurvey: undefined };
  }

  return state;
}

export const uiItwFeedbackBottomSheetSelector = (state: GlobalState): boolean =>
  state.ui.itwFeedbackBottomSheet;

export const uiActivationExitSurveySelector = (
  state: GlobalState
): UiState["activationExitSurvey"] => state.ui.activationExitSurvey;

export const uiCredentialExitSurveySelector = (
  state: GlobalState
): UiState["credentialExitSurvey"] => state.ui.credentialExitSurvey;
