import { ActionType, createStandardAction } from "typesafe-actions";

export const walletSetBottomSheetSurveyVisible = createStandardAction(
  "WALLET_SET_BOTTOM_SHEET_SURVEY_VISIBLE"
)<boolean>();

export type WalletBottomSheetActions = ActionType<
  typeof walletSetBottomSheetSurveyVisible
>;
