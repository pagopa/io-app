import { GlobalState } from "../../../../../store/reducers/types";
import { ItwUiState } from "../reducers/ui";

export const itwFeedbackBottomSheetVisibleSelector = (
  state: GlobalState
): boolean => state.features.itWallet.ui.itwFeedbackBottomSheet;

export const itwActivationExitSurveySelector = (
  state: GlobalState
): ItwUiState["activationExitSurvey"] =>
  state.features.itWallet.ui.activationExitSurvey;

export const itwCredentialExitSurveySelector = (
  state: GlobalState
): ItwUiState["credentialExitSurvey"] =>
  state.features.itWallet.ui.credentialExitSurvey;
