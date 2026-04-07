import I18n from "i18next";
import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { View, StyleSheet } from "react-native";
import { openWebUrl } from "../../../utils/url";

type Props = {
  handleOnClose: () => void;
};

const OsDismissionBanner = ({ handleOnClose }: Props) => (
  <View style={styles.margins} testID="osDismissionBannerContainer">
    <Banner
      testID="osDismissionBanner"
      title={I18n.t("features.osDismission.banner.title")}
      content={I18n.t("features.osDismission.banner.body")}
      action={I18n.t("features.osDismission.banner.action")}
      pictogramName="attention"
      color="neutral"
      onClose={handleOnClose}
      labelClose={I18n.t("global.buttons.close")}
      onPress={() =>
        openWebUrl(
          "https://assistenza.ioapp.it/hc/it/articles/30722960328337-Cosa-serve-per-accedere-a-IO"
        )
      }
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
