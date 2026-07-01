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

export const itwFreezeSimplifiedActivationRequirements = createStandardAction(
  "ITW_FREEZE_SIMPLIFIED_ACTIVATION_REQUIREMENTS"
)<void>();

export const itwClearSimplifiedActivationRequirements = createStandardAction(
  "ITW_CLEAR_SIMPLIFIED_ACTIVATION_REQUIREMENTS"
)<void>();

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

export type ItwNotEmptyWalletSuccessBannerData = {
  date: string;
  docStatus: "active" | "not_active";
  authMethod: string;
};

export const itwSetNotEmptyWalletSuccessBannerData = createStandardAction(
  "ITW_SET_NOT_EMPTY_WALLET_SUCCESS_BANNER_DATA"
)<ItwNotEmptyWalletSuccessBannerData>();

export const itwClearNotEmptyWalletSuccessBannerData = createStandardAction(
  "ITW_CLEAR_NOT_EMPTY_WALLET_SUCCESS_BANNER_DATA"
)<void>();

export type ItwPreferencesActions =
  | ActionType<typeof itwSetReviewPending>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetFiscalCodeWhitelisted>
  | ActionType<typeof itwFreezeSimplifiedActivationRequirements>
  | ActionType<typeof itwClearSimplifiedActivationRequirements>
  | ActionType<typeof itwSetPidReissuingSurveyHidden>
  | ActionType<typeof itwSetCredentialUpgradeFailed>
  | ActionType<typeof itwClearCredentialUpgradeFailed>
  | ActionType<typeof itwDisableItwActivation>
  | ActionType<typeof itwSetIdentificationMode>
  | ActionType<typeof itwSetNotEmptyWalletSuccessBannerData>
  | ActionType<typeof itwClearNotEmptyWalletSuccessBannerData>;
