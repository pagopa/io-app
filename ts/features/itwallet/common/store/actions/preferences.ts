import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwAuthLevel, StoredCredential } from "../../utils/itwTypesUtils.ts";

export const itwSetReviewPending = createStandardAction(
  "ITW_SET_REVIEW_PENDING"
)<boolean>();

export const itwSetAuthLevel = createStandardAction("ITW_SET_AUTH_LEVEL")<
  ItwAuthLevel | undefined
>();

export const itwSetClaimValuesHidden = createStandardAction(
  "ITW_SET_CLAIM_VALUES_HIDDEN"
)<boolean>();

export const itwSetWalletInstanceRemotelyActive = createStandardAction(
  "ITW_SET_WALLET_INSTANCE_REMOTELY_ACTIVE"
)<boolean | undefined>();

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
)<ReadonlyArray<StoredCredential>>();

export const itwDisableItwActivation = createStandardAction(
  "ITW_DISABLE_ITW_ACTIVATION"
)();

export type ItwPreferencesActions =
  | ActionType<typeof itwSetReviewPending>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetWalletInstanceRemotelyActive>
  | ActionType<typeof itwSetFiscalCodeWhitelisted>
  | ActionType<typeof itwFreezeSimplifiedActivationRequirements>
  | ActionType<typeof itwClearSimplifiedActivationRequirements>
  | ActionType<typeof itwSetPidReissuingSurveyHidden>
  | ActionType<typeof itwSetCredentialUpgradeFailed>
  | ActionType<typeof itwDisableItwActivation>;
