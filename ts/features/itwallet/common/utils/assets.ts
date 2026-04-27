import { CredentialType } from "./itwMocksUtils";
import { preloadImages } from "./imageCache";

/**
 * Fixed overlay images for specific credential types that require a non-random
 * configuration.
 */

export const CREDENTIAL_CARD_OVERLAYS: Record<string, number> = {
  [CredentialType.PID]: require("../../../../../img/features/itWallet/cards/overlay/pid_card_overlay.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../img/features/itWallet/cards/overlay/mdl_card_overlay.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../img/features/itWallet/cards/overlay/ts_card_overlay.png"),
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../img/features/itWallet/cards/overlay/dc_card_overlay.png")
};

export const CREDENTIAL_HEADER_OVERLAYS: Record<string, number> = {
  [CredentialType.PID]: require("../../../../../img/features/itWallet/cards/overlay/pid_header_overlay.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../img/features/itWallet/cards/overlay/mdl_header_overlay.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../img/features/itWallet/cards/overlay/ts_header_overlay.png"),
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../img/features/itWallet/cards/overlay/dc_header_overlay.png")
};

/**
 * Default credential card overlay images for random configurations
 */
export const CREDENTIAL_BASE_OVERLAYS: ReadonlyArray<number> = [
  require("../../../../../img/features/itWallet/cards/overlay/default/1.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/2.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/3.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/4.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/5.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/6.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/7.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/8.png"),
  require("../../../../../img/features/itWallet/cards/overlay/default/9.png")
];

/**
 * Corner overlay image applied on all credentials that does not have fixed
 * background/ovarlays
 */
export const CARD_CORNER_OVERLAY = require("../../../../../img/features/itWallet/cards/overlay/card_corner.png");

/**
 * Eagerly warm the image cache for all known card overlay assets.
 * This runs at module load time so images start decoding before any card mounts,
 * eliminating the pop-in effect in list screens.
 */
export const preloadItwAssets = () => {
  const allOverlaySources: ReadonlyArray<number> = [
    ...Object.values(CREDENTIAL_CARD_OVERLAYS),
    ...Object.values(CREDENTIAL_HEADER_OVERLAYS),
    ...CREDENTIAL_BASE_OVERLAYS,
    CARD_CORNER_OVERLAY
  ];

  preloadImages(allOverlaySources);
};
