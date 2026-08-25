import { GlobalState } from "../../../../../store/reducers/types";
import { ItwUiState } from "../reducers/ui";

export const uiItwFeedbackBottomSheetSelector = (state: GlobalState): boolean =>
  state.features.itWallet.ui.itwFeedbackBottomSheet;

export const uiActivationExitSurveySelector = (
  state: GlobalState
): ItwUiState["activationExitSurvey"] =>
  state.features.itWallet.ui.activationExitSurvey;

export const uiCredentialExitSurveySelector = (
  state: GlobalState
): ItwUiState["credentialExitSurvey"] =>
  state.features.itWallet.ui.credentialExitSurvey;
