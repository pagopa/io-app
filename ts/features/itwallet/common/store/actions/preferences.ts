import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwAuthLevel } from "../../utils/itwTypesUtils.ts";

export const itwCloseFeedbackBanner = createStandardAction(
  "ITW_CLOSE_FEEDBACK_BANNER"
)();

export const itwCloseDiscoveryBanner = createStandardAction(
  "ITW_CLOSE_DISCOVERY_BANNER"
)();

export const itwFlagCredentialAsRequested = createStandardAction(
  "ITW_FLAG_CREDENTIAL_AS_REQUESTED"
)<string>();

export const itwUnflagCredentialAsRequested = createStandardAction(
  "ITW_UNFLAG_CREDENTIAL_AS_REQUESTED"
)<string>();

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

export type ItwPreferencesActions =
  | ActionType<typeof itwCloseFeedbackBanner>
  | ActionType<typeof itwCloseDiscoveryBanner>
  | ActionType<typeof itwFlagCredentialAsRequested>
  | ActionType<typeof itwUnflagCredentialAsRequested>
  | ActionType<typeof itwSetReviewPending>
  | ActionType<typeof itwSetAuthLevel>
  | ActionType<typeof itwSetClaimValuesHidden>
  | ActionType<typeof itwSetWalletInstanceRemotelyActive>;
