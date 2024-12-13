import { Alert, AlertButton, Linking } from "react-native";
import React from "react";
import { IOToast } from "@pagopa/io-app-design-system";
import { RevocationReason } from "../store/reducers";
import I18n from "../../../../i18n";

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
  revocationReason?: RevocationReason;
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
const showWalletRevocationAlert = (revocationReason?: RevocationReason) => {
  switch (revocationReason) {
    case RevocationReason.CERTIFICATE_REVOKED_BY_ISSUER:
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

    case RevocationReason.NEW_WALLET_INSTANCE_CREATED:
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
    case RevocationReason.REVOKED_BY_USER:
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
