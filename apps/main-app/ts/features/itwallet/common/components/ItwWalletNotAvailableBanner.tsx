import { BodySmall, Icon, IOColors, IODimensions } from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import { withWalletCategoryFilter } from "../../../wallet/utils";
import { itwIsWalletInstanceStatusFailureSelector } from "../../walletInstance/store/selectors";

/**
 * Component shown when it is not possible to retrieve the wallet instance
 * status from the backend, because of unexpected errors.
 *
 * @deprecated Replace with `BannerErrorState` (see the TODO below)
 */
// TODO: replace with `BannerErrorState` once its label supports two paragraphs with a gap (here `message` and `cta`); that also fixes the background in dark mode
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
      <View
        style={styles.bannerContainer}
        testID="itwWalletNotAvailableBannerTestID"
      >
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
    padding: IODimensions.padding.banner,
    marginVertical: 8,
    backgroundColor: IOColors["grey-50"],
    borderRadius: IODimensions.radius.banner,
    alignItems: "center",
    gap: IODimensions.gap.banner.leading
  },
  textCenter: {
    textAlign: "center"
  }
});
