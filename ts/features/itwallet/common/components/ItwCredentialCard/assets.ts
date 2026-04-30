import { CredentialType } from "../../utils/itwMocksUtils";

/**
 * Colors from which random configurations will be generated, based on the
 * provided seed.
 */
export const CREDENTIAL_BASE_COLORS = [
  "#FFB357",
  "#CDD2FC",
  "#7AC1FA",
  "#003366"
];

/**
 * Fixed overlay images for specific credential types that require a non-random
 * configuration.
 */
export const CREDENTIAL_CARD_OVERLAYS: Record<string, number> = {
  [CredentialType.PID]: require("../../../../../../img/features/itWallet/cards/overlay/pid_card_overlay.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/overlay/mdl_card_overlay.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/overlay/ts_card_overlay.png"),
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/overlay/dc_card_overlay.png"),
  [CredentialType.AGE_VERIFICATION]: require("../../../../../../img/features/itWallet/cards/overlay/av_card_overlay.png")
};

export const CREDENTIAL_HEADER_OVERLAYS: Record<string, number> = {
  [CredentialType.PID]: require("../../../../../../img/features/itWallet/cards/overlay/pid_header_overlay.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/overlay/mdl_header_overlay.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/overlay/ts_header_overlay.png"),
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/overlay/dc_header_overlay.png"),
  [CredentialType.AGE_VERIFICATION]: require("../../../../../../img/features/itWallet/cards/overlay/av_header_overlay.png")
};

/**
 * Pattern overlay images by credential taxonomy category
 * !IMPORTANT: keys are provisional and may change in the future once the taxonomy is finalized.
 */
export const CREDENTIAL_PATTERN_OVERLAYS = {
  bonus: require("../../../../../../img/features/itWallet/cards/overlay/pattern/bonus.png"),
  education: require("../../../../../../img/features/itWallet/cards/overlay/pattern/education.png"),
  family: require("../../../../../../img/features/itWallet/cards/overlay/pattern/family.png"),
  financial: require("../../../../../../img/features/itWallet/cards/overlay/pattern/financial.png"),
  identity: require("../../../../../../img/features/itWallet/cards/overlay/pattern/identity.png"),
  lifestyle: require("../../../../../../img/features/itWallet/cards/overlay/pattern/lifestyle.png"),
  travel: require("../../../../../../img/features/itWallet/cards/overlay/pattern/travel.png"),
  work: require("../../../../../../img/features/itWallet/cards/overlay/pattern/work.png")
};

/**
 * Corner overlay image applied on all credentials that does not have fixed
 * background/ovarlays
 */
export const CREDENTIAL_CARD_CORNER_OVERLAY = require("../../../../../../img/features/itWallet/cards/overlay/card_corner.png");
