import { CieManager } from "@pagopa/io-react-native-cie";
import { ActionArgs } from "xstate";
import I18n from "i18next";
import {
  CieCardReadingFailureReason,
  ItwFlow,
  trackItWalletCardReadingClose,
  trackItWalletCieCardReadingFailure,
  trackItWalletCieCardReadingSuccess,
  trackItWalletCieCardReadingUnexpectedFailure,
  trackItWalletCieCardVerifyFailure,
  trackItWalletErrorCardReading,
  trackItWalletErrorPin,
  trackItWalletLastErrorPin,
  trackItWalletSecondErrorPin
} from "../../../analytics";
import { isNfcError } from "../utils/error";
import { getProgressEmojis } from "../../../../common/utils/cie";
import { CieContext } from "./context";
import { CieEvents } from "./events";

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
    // readProgress is a number between 0 and 1, mixpanel needs a number between 0 and 100
    const progress = Number(((readProgress ?? 0) * 100).toFixed(0));

    if (isNfcError(failure)) {
      switch (failure.name) {
        case "TAG_LOST":
          trackItWalletErrorCardReading(itw_flow, progress);
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
            reason: "CERTIFICATE_EXPIRED",
            cie_reading_progress: progress
          });
          return;
        case "CERTIFICATE_REVOKED":
          trackItWalletCieCardVerifyFailure({
            itw_flow,
            reason: "CERTIFICATE_REVOKED",
            cie_reading_progress: progress
          });
          return;
        case "NOT_A_CIE":
          trackItWalletCieCardReadingFailure({
            reason: CieCardReadingFailureReason.ON_TAG_DISCOVERED_NOT_CIE,
            itw_flow,
            cie_reading_progress: progress
          });
          return;
        case "GENERIC_ERROR":
        case "APDU_ERROR":
        case "NO_INTERNET_CONNECTION":
        case "AUTHENTICATION_ERROR":
          trackItWalletCieCardReadingFailure({
            reason: CieCardReadingFailureReason[failure.name],
            itw_flow,
            cie_reading_progress: progress
          });
          return;

        case "CANCELLED_BY_USER":
          trackItWalletCardReadingClose(progress);
          return;
        case "WEBVIEW_ERROR": // No tracking
          return;
      }
    }

    trackItWalletCieCardReadingUnexpectedFailure({
      reason: failure?.name ?? "UNEXPECTED_ERROR",
      cie_reading_progress: progress
    });
  }
};
