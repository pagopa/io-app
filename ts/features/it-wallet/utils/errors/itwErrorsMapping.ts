import I18n from "../../../../i18n";
import {
  ItWalletError,
  ItWalletErrorTypes,
  ItWalletMappedError
} from "./itwErrors";

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
    case ItWalletErrorTypes.NFC_NOT_SUPPORTED:
      return {
        title: I18n.t("features.itWallet.infoAuthScreen.errors.nfc.title"),
        body: I18n.t("features.itWallet.infoAuthScreen.errors.nfc.body")
      };
    case ItWalletErrorTypes.CREDENTIAL_ALREADY_EXISTING_ERROR:
      return {
        title: I18n.t(
          "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.title"
        ),
        body: I18n.t(
          "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.subtitle"
        )
      };
    default:
      return getItwGenericError();
  }
};
