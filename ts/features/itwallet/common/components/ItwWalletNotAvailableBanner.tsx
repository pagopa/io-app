import { StyleSheet, View } from "react-native";
import {
  BodySmall,
  IOAlertSpacing,
  IOColors,
  Icon
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsWalletInstanceStatusFailureSelector } from "../../walletInstance/store/selectors";
import { withWalletCategoryFilter } from "../../../wallet/utils";

/**
 * Component shown when it is not possible to retrieve the wallet instance status
 * from the backend, because of unexpected errors.
 */
export const ItwWalletNotAvailableBanner = withWalletCategoryFilter(
  "itw",
  () => {
    const isWalletInstanceStatusFailure = useIOSelector(
      itwIsWalletInstanceStatusFailureSelector
    );

    if (!isWalletInstanceStatusFailure) {
      return null;
    }

    return (
      <View style={styles.bannerContainer}>
        <Icon name="warningFilled" />
        <BodySmall style={styles.textCenter}>
          {I18n.t("features.itWallet.generic.walletNotAvailable.message")}
        </BodySmall>
        <BodySmall style={styles.textCenter}>
          {I18n.t("features.itWallet.generic.walletNotAvailable.cta")}
        </BodySmall>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  bannerContainer: {
    padding: IOAlertSpacing[1],
    marginVertical: 16,
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    alignItems: "center",
    gap: 8
  },
  textCenter: {
    textAlign: "center"
  }
});
