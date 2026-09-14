import { ActionType, createStandardAction } from "typesafe-actions";

import { MixPanelCredential } from "../../../analytics/utils/types";
import { EidActivationExitStep } from "../../hooks/useItwActivationExitSurveyBottomSheet.tsx";
import { CredentialExitStep } from "../../hooks/useItwCredentialExitSurveyBottomSheet.tsx";

export const itwSetFeedbackBottomSheetVisible = createStandardAction(
  "ITW_SET_ITW_FEEDBACK_BOTTOM_SHEET_VISIBLE"
)<boolean>();

export const itwSetActivationExitSurvey = createStandardAction(
  "ITW_SET_ACTIVATION_EXIT_SURVEY"
)<undefined | { step: EidActivationExitStep }>();

export const itwSetCredentialExitSurvey = createStandardAction(
  "ITW_SET_CREDENTIAL_EXIT_SURVEY"
)<undefined | { credential: MixPanelCredential; step: CredentialExitStep }>();

export type ItwUiActions = ActionType<
  | typeof itwSetActivationExitSurvey
  | typeof itwSetCredentialExitSurvey
  | typeof itwSetFeedbackBottomSheetVisible
>;
