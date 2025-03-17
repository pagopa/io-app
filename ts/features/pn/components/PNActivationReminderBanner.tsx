import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import PN_ROUTES from "../navigation/routes";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";

type Props = {
  handleOnClose: () => void;
};

export const PNActivationReminderBanner = ({ handleOnClose }: Props) => {
  const navigation = useIONavigation();

  const navigateToActivationFlow = () =>
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.ACTIVATION_BANNER_FLOW
      }
    });
  return (
    <View style={styles.margins}>
      <Banner
        testID="pn-banner"
        title={I18n.t("features.pn.reminderBanner.title")}
        content={I18n.t("features.pn.reminderBanner.body")}
        action={I18n.t("features.pn.reminderBanner.cta")}
        color="neutral"
        onPress={navigateToActivationFlow}
        pictogramName="message"
        onClose={handleOnClose}
        labelClose={I18n.t("global.buttons.close")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
