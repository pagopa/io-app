import { Banner, IOVisualCostants } from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { openWebUrl } from "../../../utils/url";

type Props = {
  handleOnClose: () => void;
};

const OsDismissionBanner = ({ handleOnClose }: Props) => (
  <View style={styles.margins} testID="osDismissionBannerContainer">
    <Banner
      action={I18n.t("features.osDismission.banner.action")}
      color="neutral"
      content={I18n.t("features.osDismission.banner.body")}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
      onPress={() =>
        openWebUrl(
          "https://assistenza.ioapp.it/hc/it/articles/30722960328337-Cosa-serve-per-accedere-a-IO"
        )
      }
      pictogramName="attention"
      testID="osDismissionBanner"
      title={I18n.t("features.osDismission.banner.title")}
    />
  </View>
);

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});

export default OsDismissionBanner;
