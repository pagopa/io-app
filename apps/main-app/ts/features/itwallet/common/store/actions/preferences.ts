import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwAuthLevel, CredentialMetadata } from "../../utils/itwTypesUtils.ts";
import { IdentificationContext } from "../../../machine/eid/context.ts";

export const itwSetReviewPending = createStandardAction(
  "ITW_SET_REVIEW_PENDING"
)<boolean>();

export const itwSetAuthLevel = createStandardAction("ITW_SET_AUTH_LEVEL")<
  ItwAuthLevel | undefined
>();

export const itwSetClaimValuesHidden = createStandardAction(
  "ITW_SET_CLAIM_VALUES_HIDDEN"
)<boolean>();

export const itwSetFiscalCodeWhitelisted = createStandardAction(
  "ITW_SET_FISCAL_CODE_WHITELISTED"
)<boolean>();

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

export const itwSetIdentificationMode = createStandardAction(
  "ITW_SET_IDENTIFICATION_MODE"
)<IdentificationContext["mode"] | undefined>();

export type ItwWalletActivationFeedbackBannerData = {
  date: string;
  docStatus: "active" | "not_active";
  authMethod: string;
};

export const itwSetWalletActivationFeedbackBannerData = createStandardAction(
  "ITW_SET_WALLET_ACTIVATION_FEEDBACK_BANNER_DATA"
)<ItwWalletActivationFeedbackBannerData>();

export const itwClearWalletActivationFeedbackBannerData = createStandardAction(
  "ITW_CLEAR_WALLET_ACTIVATION_FEEDBACK_BANNER_DATA"
)<void>();

export type ItwPreferencesActions =
  | ActionType<typeof itwSetReviewPending>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetFiscalCodeWhitelisted>
  | ActionType<typeof itwSetPidReissuingSurveyHidden>
  | ActionType<typeof itwSetCredentialUpgradeFailed>
  | ActionType<typeof itwClearCredentialUpgradeFailed>
  | ActionType<typeof itwDisableItwActivation>
  | ActionType<typeof itwSetIdentificationMode>
  | ActionType<typeof itwSetWalletActivationFeedbackBannerData>
  | ActionType<typeof itwClearWalletActivationFeedbackBannerData>;
