import { CieManager } from "@pagopa/io-react-native-cie";
import { ActionArgs } from "xstate";
import I18n from "i18next";
import {
  ItwFlow,
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingFailure,
  trackItWalletCieCardReadingSuccess,
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

export const cieMachineActions = {
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

  trackSuccess: ({
    context: { isL3 }
  }: ActionArgs<CieContext, CieEvents, CieEvents>) => {
    trackItWalletCieCardReadingSuccess(isL3 ? "L3" : "L2");
  },

  trackError: ({
    context: { failure, isL3, readProgress }
  }: ActionArgs<CieContext, CieEvents, CieEvents>) => {
    const itw_flow: ItwFlow = isL3 ? "L3" : "L2";
    const progress = readProgress ?? 0;

    if (isNfcError(failure)) {
      switch (failure.name) {
        case "WEBVIEW_ERROR": // No tracking
          return;
        case "NOT_A_CIE":
          trackItWalletCieCardReadingFailure({
            reason: "unknown card",
            itw_flow,
            cie_reading_progress: progress
          });
          return;
        case "APDU_ERROR":
          trackItWalletCieCardReadingFailure({
            reason: "ADPU not supported",
            itw_flow,
            cie_reading_progress: progress
          });
          return;
        case "WRONG_PIN":
          if (failure.attemptsLeft > 1) {
            trackItWalletErrorPin(itw_flow, progress);
          } else {
            trackItWalletSecondErrorPin(itw_flow, progress);
          }
          return;
        case "CARD_BLOCKED":
          trackItWalletLastErrorPin(itw_flow, progress);
          return;
        case "CERTIFICATE_EXPIRED":
          trackItWalletCieCardVerifyFailure({
            itw_flow,
            reason: "certificate expired",
            cie_reading_progress: progress
          });
          return;
        case "CERTIFICATE_REVOKED":
          trackItWalletCieCardVerifyFailure({
            itw_flow,
            reason: "certificate revoked",
            cie_reading_progress: progress
          });
          return;
        case "CANCELLED_BY_USER":
          trackItWalletCardReadingClose(progress);
          return;
      }
    }

    trackItWalletCieCardReadingFailure({
      reason: "KO",
      itw_flow,
      cie_reading_progress: progress
    });
  }
};
