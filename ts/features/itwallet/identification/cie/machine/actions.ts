import { CieManager } from "@pagopa/io-react-native-cie";
import { ActionArgs } from "xstate";
import I18n from "../../../../../i18n";
import { CieContext } from "./context";
import { CieEvents } from "./events";

/**
 * Get the progress emojis based on the reading progress.
 * @param progress The reading progress value from 0 to 1.
 * @returns A string representing the progress bar with emojis,
 */
const getProgressEmojis = (progress: number) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const totalDots = 8; // Length of the progress bar
  const blueDots = Math.floor(clampedProgress * totalDots);
  const whiteDots = totalDots - blueDots;

  const blueDotEmoji = "🔵";
  const whiteDotyEmoji = "⚪";

  return blueDotEmoji.repeat(blueDots) + whiteDotyEmoji.repeat(whiteDots);
};

export const createCieActionsImplementation = () => ({
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
  }
});
