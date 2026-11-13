import {
  BodySmall,
  Icon,
  IODimensions,
  useIOColors
} from "@io-app/design-system";
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
// TODO: replace with `BannerErrorState` once its label supports two paragraphs with a gap (here `message` and `cta`)
export const ItwWalletNotAvailableBanner = withWalletCategoryFilter(
  "itw",
  () => {
    const colors = useIOColors();
    const isWalletInstanceStatusFailure = useIOSelector(
      itwIsWalletInstanceStatusFailureSelector
    );

    if (!isWalletInstanceStatusFailure) {
      return null;
    }

    return (
      <View
        style={[
          styles.bannerContainer,
          { backgroundColor: colors.component.banner.background.neutral }
        ]}
        testID="itwWalletNotAvailableBannerTestID"
      >
        <Icon
          color={colors.component.banner.foreground.content}
          name="warningFilled"
        />
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
    borderRadius: IODimensions.radius.banner,
    alignItems: "center",
    gap: IODimensions.gap.banner.leading
  },
  textCenter: {
    textAlign: "center"
  }
});
