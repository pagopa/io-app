import I18n from "../../../../i18n";
import { ItWalletError, ItWalletMappedError } from "./itwErrors";

/**
 * Maps an ItWalletError to an ItWalletMappedError to display an error in the requirements screen.
 * @param error an instance of ItWalletError containg the code to be translated.
 * @returns a title and a body messages to be displayed to the user if the error is known, otherwise a generic error title and body.
 */
export const mapRequirementsError = (
  error: ItWalletError
): ItWalletMappedError => {
  switch (error.code) {
    case "NFC_NOT_SUPPORTED":
      return {
        title: I18n.t(
          "features.itWallet.requirementsScreen.nfcNotSupportedTitle"
        ),
        body: I18n.t("features.itWallet.requirementsScreen.nfcNotSupportedBody")
      };
    default:
      return {
        title: I18n.t("features.itWallet.generic.errorInfo.title"),
        body: I18n.t("features.itWallet.generic.errorInfo.subTitle")
      };
  }
};
