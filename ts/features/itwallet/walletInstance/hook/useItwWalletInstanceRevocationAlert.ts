import { Alert } from "react-native";
import { useCallback } from "react";
import I18n from "i18next";
import { WalletInstanceRevocationReason } from "../../common/utils/itwTypesUtils";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwWalletInstanceStatusSelector } from "../store/selectors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwUpdateWalletInstanceStatus } from "../store/actions";
import { openWebUrl } from "../../../../utils/url";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  DOCUMENTS_ON_IO_FAQ_12_URL_BODY,
  DOCUMENTS_ON_IO_FAQ_14_URL_BODY
} from "../../../../urls";

const closeButtonText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.closeButton"
);
const alertCtaText = I18n.t(
  "features.itWallet.walletInstanceRevoked.alert.cta"
);

/**
 * Hook to monitor wallet instance status and display alerts if revoked.
 */
export const useItwWalletInstanceRevocationAlert = () => {
  const walletInstanceStatus = useIOSelector(itwWalletInstanceStatusSelector);
  const dispatch = useIODispatch();

  const itwMinIntegrityReqUrl = useIOSelector(state =>
    generateDynamicUrlSelector(
      state,
      "io_showcase",
      DOCUMENTS_ON_IO_FAQ_12_URL_BODY
    )
  );
  const itwDocsOnIOMultipleDevicesUrl = useIOSelector(state =>
    generateDynamicUrlSelector(
      state,
      "io_showcase",
      DOCUMENTS_ON_IO_FAQ_14_URL_BODY
    )
  );

  useOnFirstRender(
    useCallback(() => {
      if (walletInstanceStatus?.is_revoked) {
        showWalletRevocationAlert(
          itwMinIntegrityReqUrl,
          itwDocsOnIOMultipleDevicesUrl,
          walletInstanceStatus.revocation_reason
        );
        dispatch(itwUpdateWalletInstanceStatus.cancel());
      }
    }, [
      walletInstanceStatus,
      itwMinIntegrityReqUrl,
      itwDocsOnIOMultipleDevicesUrl,
      dispatch
    ])
  );
};

/**
 * Displays an alert based on the revocation reason.
 */
const showWalletRevocationAlert = (
  itwMinIntegrityReqUrl: string,
  itwDocsOnIOMultipleDevicesUrl: string,
  revocationReason?: WalletInstanceRevocationReason
) => {
  switch (revocationReason) {
    case "CERTIFICATE_REVOKED_BY_ISSUER":
      Alert.alert(
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
            onPress: () => openWebUrl(itwMinIntegrityReqUrl)
          }
        ]
      );
      break;

    case "NEW_WALLET_INSTANCE_CREATED":
      Alert.alert(
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
            onPress: () => openWebUrl(itwDocsOnIOMultipleDevicesUrl)
          }
        ]
      );
      break;
    case "REVOKED_BY_USER":
      Alert.alert(
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
