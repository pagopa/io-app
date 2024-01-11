import I18n from "../../../i18n";
import ItwKoView from "../components/ItwKoView";

/**
 * Type for errors which might occur during the it-wallet flow.
 * These errors are a superset of HTTP errors with custom error codes.
 */
export type ItWalletError = {
  code: ItWalletErrorTypes;
  message?: string;
};

/**
 * Type for mapped errors to be displayed to the user with a title and a body.
 */
export type ItWalletMappedError = {
  title: string;
  body: string;
};

/**
 * Type for error mapping functions which map an error to a component to be displayed to the user.
 * The function must takes an {@link ItWalletError} and returns a {@link ItwKoViewProps}
 */
export type ItwErrorMapping = (
  error?: ItWalletError
) => React.ComponentProps<typeof ItwKoView>;

/**
 * Requirements error codes
 */
export enum ItWalletErrorTypes {
  NFC_NOT_SUPPORTED = "NFC_NOT_SUPPORTED",
  WIA_ISSUANCE_ERROR = "WIA_ISSUANCE_ERROR", // not mapped yet,
  PID_ISSUANCE_ERROR = "PID_ISSUANCE_ERR", // not mapped yet
  PID_DECODING_ERROR = "PID_DECODING_ERROR", // not mapped yet
  RP_INITIALIZATION_ERROR = "RP_INITIALIZATION_ERROR", // not mapped yet
  WALLET_NOT_VALID_ERROR = "WALLET_NOT_VALID_ERROR", // not mapped yet
  RP_PRESENTATION_ERROR = "RP_PRESENTATION_ERROR", // not mapped yet
  CREDENTIAL_ALREADY_EXISTING_ERROR = "CREDENTIAL_ALREADY_EXISTING_ERROR",
  CREDENTIAL_CHECKS_GENERIC_ERROR = "CREDENTIAL_CHECKS_GENERIC_ERROR", // not mapped yet
  CREDENTIAL_ADD_ERROR = "CREDENTIAL_ADD_ERROR", // not mapped yet
  PROXIMITY_GENERIC_ERROR = "PROXIMITY_GENERIC_ERROR" // not mapped yet
}

/**
 * Getter for a generic mapped error which can be displayed to the user by using {@link ItwKoView}.
 * It has a title, a body and a back button.
 * @param onPress the function to be called when the user presses the back button.
 * @returns a generic ItWalletMappedError.
 */
export const getItwGenericMappedError = (
  onPress: () => any
): React.ComponentProps<typeof ItwKoView> => ({
  title: I18n.t("features.itWallet.generic.error.title"),
  subtitle: I18n.t("features.itWallet.generic.error.body"),
  action: {
    accessibilityLabel: I18n.t("global.buttons.back"),
    label: I18n.t("global.buttons.back"),
    onPress
  },
  pictogram: "fatalError"
});
