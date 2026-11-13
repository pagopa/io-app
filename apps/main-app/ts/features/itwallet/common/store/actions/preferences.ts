import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { IdentificationContext } from "../../../machine/eid/context.ts";
import { CredentialMetadata, ItwAuthLevel } from "../../utils/itwTypesUtils.ts";

export const itwSetAuthLevel = createStandardAction("ITW_SET_AUTH_LEVEL")<
  ItwAuthLevel | undefined
>();

export const itwSetClaimValuesHidden = createStandardAction(
  "ITW_SET_CLAIM_VALUES_HIDDEN"
)<boolean>();

export const itwSetFiscalCodeWhitelisted = createStandardAction(
  "ITW_SET_FISCAL_CODE_WHITELISTED"
)<boolean>();

export const itwSetEngagementScreenShown = createAction(
  "ITW_SET_ENGAGEMENT_SCREEN_SHOWN",
  resolve => (hashedFiscalCode: string) => resolve(hashedFiscalCode)
);

export const itwResetEngagementScreenShown = createStandardAction(
  "ITW_RESET_ENGAGEMENT_SCREEN_SHOWN"
)();

export const itwSetPidReissuingSurveyHidden = createStandardAction(
  "ITW_SET_PID_REISSUING_SURVEY_HIDDEN"
)<boolean>();

export const itwSetCredentialUpgradeFailed = createStandardAction(
  "ITW_SET_CREDENTIAL_UPGRADE_FAILED"
)<ReadonlyArray<CredentialMetadata["credentialType"]>>();

export const itwClearCredentialUpgradeFailed = createStandardAction(
  "ITW_CLEAR_CREDENTIAL_UPGRADE_FAILED"
)<CredentialMetadata["credentialType"]>();

export const itwDisableItwActivation = createStandardAction(
  "ITW_DISABLE_ITW_ACTIVATION"
)();

/** Records a successful activation through an IT-Wallet fallback. */
export const itwSetL2Fallback = createStandardAction(
  "ITW_SET_L2_FALLBACK"
)<boolean>();

export const itwSetIdentificationMode = createStandardAction(
  "ITW_SET_IDENTIFICATION_MODE"
)<IdentificationContext["mode"] | undefined>();

/** Local override enabling NFC engagement in the Proximity presentation. */
export const itwSetProximityNfcLocallyEnabled = createStandardAction(
  "ITW_SET_PROXIMITY_NFC_LOCALLY_ENABLED"
)<boolean>();

/** Local override showing the What's New engagement screen. */
export const itwSetWhatsNewLocallyEnabled = createStandardAction(
  "ITW_SET_WHATS_NEW_LOCALLY_ENABLED"
)<boolean>();

export type ItwWalletActivationFeedbackBannerData = {
  authMethod: string;
  docStatus: "active" | "not_active";
};

export const itwSetWalletActivationFeedbackBannerData = createStandardAction(
  "ITW_SET_WALLET_ACTIVATION_FEEDBACK_BANNER_DATA"
)<ItwWalletActivationFeedbackBannerData>();

export const itwClearWalletActivationFeedbackBannerData = createStandardAction(
  "ITW_CLEAR_WALLET_ACTIVATION_FEEDBACK_BANNER_DATA"
)<void>();

export const itwSetDiscoverMoreCEDEnabled = createStandardAction(
  "ITW_SET_DISCOVER_MORE_CED_ENABLED"
)<boolean>();

export type ItwPreferencesActions =
  | ActionType<typeof itwClearCredentialUpgradeFailed>
  | ActionType<typeof itwClearWalletActivationFeedbackBannerData>
  | ActionType<typeof itwDisableItwActivation>
  | ActionType<typeof itwResetEngagementScreenShown>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetCredentialUpgradeFailed>
  | ActionType<typeof itwSetDiscoverMoreCEDEnabled>
  | ActionType<typeof itwSetEngagementScreenShown>
  | ActionType<typeof itwSetFiscalCodeWhitelisted>
  | ActionType<typeof itwSetIdentificationMode>
  | ActionType<typeof itwSetL2Fallback>
  | ActionType<typeof itwSetPidReissuingSurveyHidden>
  | ActionType<typeof itwSetProximityNfcLocallyEnabled>
  | ActionType<typeof itwSetWalletActivationFeedbackBannerData>
  | ActionType<typeof itwSetWhatsNewLocallyEnabled>;
