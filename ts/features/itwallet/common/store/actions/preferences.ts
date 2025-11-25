import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwAuthLevel } from "../../utils/itwTypesUtils.ts";

export const itwCloseDiscoveryBanner = createStandardAction(
  "ITW_CLOSE_DISCOVERY_BANNER"
)();

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

export const itwSetWalletUpgradeMDLDetailsBannerHidden = createStandardAction(
  "ITW_SET_WALLET_UPGRADE_MDL_DETAILS_BANNER_HIDDEN"
)<boolean>();

export const itwFreezeSimplifiedActivationRequirements = createStandardAction(
  "ITW_FREEZE_SIMPLIFIED_ACTIVATION_REQUIREMENTS"
)<void>();

export const itwClearSimplifiedActivationRequirements = createStandardAction(
  "ITW_CLEAR_SIMPLIFIED_ACTIVATION_REQUIREMENTS"
)<void>();

export type ItwPreferencesActions =
  | ActionType<typeof itwCloseDiscoveryBanner>
  | ActionType<typeof itwSetReviewPending>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetWalletInstanceRemotelyActive>
  | ActionType<typeof itwSetFiscalCodeWhitelisted>
  | ActionType<typeof itwSetWalletUpgradeMDLDetailsBannerHidden>
  | ActionType<typeof itwFreezeSimplifiedActivationRequirements>
  | ActionType<typeof itwClearSimplifiedActivationRequirements>;
