import I18n from "../../../../i18n";
import { ItWalletError, ItWalletMappedError } from "./itwErrors";

/**
 * Getter for a generic error title and body.
 * @returns a generic ItWalletMappedError.
 */
export const getItwGenericError = (): ItWalletMappedError => ({
  title: I18n.t("features.itWallet.generic.error.title"),
  body: I18n.t("features.itWallet.generic.error.body")
});

/**
 * Maps an ItWalletError to an ItWalletMappedError to display an error message to the user.
 * @param error an instance of ItWalletError containg the code to be translated.
 * @returns a title and a body messages to be displayed to the user if the error is known, otherwise a generic error title and body.
 */
export const mapItwError = (error: ItWalletError): ItWalletMappedError => {
  switch (error.code) {
    case "NFC_NOT_SUPPORTED":
      return {
        title: I18n.t("features.itWallet.infoAuthScreen.errors.nfc.title"),
        body: I18n.t("features.itWallet.infoAuthScreen.errors.nfc.body")
      };
    default:
      return getItwGenericError();
  }
};
