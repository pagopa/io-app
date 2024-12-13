import { Alert, AlertButton, Linking } from "react-native";
import React from "react";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { WalletInstanceRevocationReason } from "../../common/utils/itwTypesUtils";

const closeButtonText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.closeButton"
);
const alertCtaText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.cta"
);

const itwMinIntergityReqUrl = "https://io.italia.it/documenti-su-io/faq/#n1_12";

/**
 * Hook to monitor wallet instance status and display alerts if revoked.
 * @param walletInstanceStatus - The status of the wallet instance, including whether it is revoked and the reason for revocation.
 */
export const useItwWalletInstanceRevocationAlert = (walletInstanceStatus: {
  isRevoked: boolean;
  revocationReason?: WalletInstanceRevocationReason;
}) => {
  React.useEffect(() => {
    if (walletInstanceStatus.isRevoked) {
      showWalletRevocationAlert(walletInstanceStatus.revocationReason);
    }
  }, [walletInstanceStatus]);
};

/**
 * Displays an alert based on the revocation reason.
 */
const showWalletRevocationAlert = (
  revocationReason?: WalletInstanceRevocationReason
) => {
  switch (revocationReason) {
    case "CERTIFICATE_REVOKED_BY_ISSUER":
      showAlert(
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.revokedByWalletProvider.title"
        ),
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.revokedByWalletProvider.content"
        ),
        [
          { text: closeButtonText },
          {
            text: alertCtaText,
            onPress: () => {
              Linking.openURL(itwMinIntergityReqUrl).catch(() => {
                IOToast.error(I18n.t("global.genericError"));
              });
            }
          }
        ]
      );
      break;

    case "NEW_WALLET_INSTANCE_CREATED":
      showAlert(
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.newWalletInstanceCreated.title"
        ),
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.newWalletInstanceCreated.content"
        ),
        [
          { text: closeButtonText },
          {
            text: alertCtaText,
            onPress: () => {
              // TODO: Add the correct URL
              Linking.openURL("").catch(() => {
                IOToast.error(I18n.t("global.genericError"));
              });
            }
          }
        ]
      );
      break;
    case "REVOKED_BY_USER":
      showAlert(
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.revokedByUser.title"
        ),
        I18n.t(
          "features.itWallet.walletInstanceRevoked.alert.revokedByUser.content"
        ),
        [
          {
            text: I18n.t(
              "features.itWallet.walletInstanceRevoked.alert.closeButtonAlt"
            )
          }
        ]
      );
      break;
    default:
      break;
  }
};

const showAlert = (
  title: string,
  message: string,
  buttons: Array<AlertButton> = [{ text: closeButtonText }]
) => {
  Alert.alert(title, message, buttons);
};
