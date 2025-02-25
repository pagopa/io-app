import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";

type Props = {
  handleOnClose: () => void;
};

export const PNActivationReminderBanner = ({ handleOnClose }: Props) => (
  <View style={styles.margins}>
    <Banner
      title={I18n.t("features.pn.reminderBanner.title")}
      content={I18n.t("features.pn.reminderBanner.body")}
      action={I18n.t("features.pn.reminderBanner.cta")}
      color="neutral"
      onPress={() => null}
      pictogramName="message"
      size="big"
      onClose={handleOnClose}
      labelClose={I18n.t("global.buttons.close")}
    />
  </View>
);

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
