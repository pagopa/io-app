import { ActionType, createStandardAction } from "typesafe-actions";

import { MixPanelCredential } from "../../features/itwallet/analytics/utils/types";
import { EidActivationExitStep } from "../../features/itwallet/common/hooks/useItwActivationExitSurveyBottomSheet.tsx";
import { CredentialExitStep } from "../../features/itwallet/common/hooks/useItwCredentialExitSurveyBottomSheet.tsx";

export const uiShowItwFeedbackBottomSheet = createStandardAction(
  "UI_SHOW_ITW_FEEDBACK_BOTTOM_SHEET"
)<void>();

export const uiHideItwFeedbackBottomSheet = createStandardAction(
  "UI_HIDE_ITW_FEEDBACK_BOTTOM_SHEET"
)<void>();

export const uiShowActivationExitSurvey = createStandardAction(
  "UI_SHOW_ACTIVATION_EXIT_SURVEY"
)<{ step: EidActivationExitStep }>();

export const uiHideActivationExitSurvey = createStandardAction(
  "UI_HIDE_ACTIVATION_EXIT_SURVEY"
)<void>();

export const uiShowCredentialExitSurvey = createStandardAction(
  "UI_SHOW_CREDENTIAL_EXIT_SURVEY"
)<{ credential: MixPanelCredential; step: CredentialExitStep }>();

export const uiHideCredentialExitSurvey = createStandardAction(
  "UI_HIDE_CREDENTIAL_EXIT_SURVEY"
)<void>();

export type UiActions = ActionType<
  | typeof uiHideActivationExitSurvey
  | typeof uiHideCredentialExitSurvey
  | typeof uiHideItwFeedbackBottomSheet
  | typeof uiShowActivationExitSurvey
  | typeof uiShowCredentialExitSurvey
  | typeof uiShowItwFeedbackBottomSheet
>;
