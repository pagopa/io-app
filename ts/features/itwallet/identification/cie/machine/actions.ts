import { CieManager } from "@pagopa/io-react-native-cie";
import { ActionArgs } from "xstate";
import I18n from "../../../../../i18n";
import {
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingFailure,
  trackItWalletCieCardVerifyFailure,
  trackItWalletErrorPin,
  trackItWalletLastErrorPin,
  trackItWalletSecondErrorPin
} from "../../../analytics";
import { isNfcError } from "../utils/error";
import { CieContext } from "./context";
import { CieEvents } from "./events";

/**
 * Get the progress emojis based on the reading progress.
 * @param progress The reading progress value from 0 to 1.
 * @returns A string representing the progress bar with emojis,
 */
export const getProgressEmojis = (progress: number) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const totalDots = 8; // Length of the progress bar
  const blueDots = Math.floor(clampedProgress * totalDots);
  const whiteDots = totalDots - blueDots;

  const blueDotEmoji = "🔵";
  const whiteDotyEmoji = "⚪";

  return blueDotEmoji.repeat(blueDots) + whiteDotyEmoji.repeat(whiteDots);
};

export default {
  /**
   * Configures the (idle) status alerts for the iOS NFC system dialog
   */
  configureStatusAlerts: () => {
    CieManager.setAlertMessage(
      "readingInstructions",
      I18n.t("features.itWallet.identification.cie.readingCard.ios.idle.status")
    );
    CieManager.setAlertMessage(
      "readingSuccess",
      I18n.t(
        "features.itWallet.identification.cie.readingCard.ios.completed.status"
      )
    );
  },

  /**
   * Updates the status alert for the iOS NFC system dialog with the current reading progress.
   */
  updateStatusAlert: ({
    context
  }: ActionArgs<CieContext, CieEvents, CieEvents>) => {
    const progress = getProgressEmojis(context.readProgress ?? 0);
    const label = I18n.t(
      "features.itWallet.identification.cie.readingCard.ios.reading.status"
    );
    CieManager.setCurrentAlertMessage(`${progress}\n${label}`);
  },

  trackError: ({
    context: { failure }
  }: ActionArgs<CieContext, CieEvents, CieEvents>) => {
    if (isNfcError(failure)) {
      switch (failure.name) {
        case "WEBVIEW_ERROR": // No tracking
          return;
        case "NOT_A_CIE":
          trackItWalletCieCardReadingFailure({ reason: "unknown card" });
          return;
        case "APDU_ERROR":
          trackItWalletCieCardReadingFailure({ reason: failure.message });
          return;
        case "WRONG_PIN":
          if (failure.attemptsLeft > 1) {
            trackItWalletErrorPin();
          } else {
            trackItWalletSecondErrorPin();
          }
          return;
        case "CARD_BLOCKED":
          trackItWalletLastErrorPin();
          return;
        case "CERTIFICATE_EXPIRED":
        case "CERTIFICATE_REVOKED":
          trackItWalletCieCardVerifyFailure();
          return;
        case "CANCELLED_BY_USER":
          trackItWalletCardReadingClose();
          return;
      }
    }

    trackItWalletCieCardReadingFailure({ reason: "KO" });
  }
};
