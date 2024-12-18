import { Alert, AlertButton, Linking } from "react-native";
import { useCallback } from "react";
import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { WalletInstanceRevocationReason } from "../../common/utils/itwTypesUtils";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwWalletInstanceStatusSelector } from "../store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwUpdateWalletInstanceStatus } from "../store/actions";

const closeButtonText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.closeButton"
);
const alertCtaText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.cta"
);

const itwMinIntegrityReqUrl = "https://io.italia.it/documenti-su-io/faq/#n1_12";
const itwDocsOnIOMultipleDevicesUrl =
  "https://io.italia.it/documenti-su-io/faq/#n1_14";

/**
 * Hook to monitor wallet instance status and display alerts if revoked.
 * @param walletInstanceStatus - The status of the wallet instance, including whether it is revoked and the reason for revocation.
 */
export const useItwWalletInstanceRevocationAlert = () => {
  const walletInstanceStatus = useIOSelector(itwWalletInstanceStatusSelector);
  const dispatch = useIODispatch();

  useOnFirstRender(
    useCallback(() => {
      if (walletInstanceStatus?.is_revoked) {
        showWalletRevocationAlert(walletInstanceStatus.revocation_reason);
        dispatch(itwUpdateWalletInstanceStatus(undefined));
      }
    }, [walletInstanceStatus, dispatch])
  );
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
              Linking.openURL(itwMinIntegrityReqUrl).catch(() => {
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
              Linking.openURL(itwDocsOnIOMultipleDevicesUrl).catch(() => {
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
