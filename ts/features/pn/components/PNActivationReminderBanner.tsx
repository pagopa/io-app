import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../store/hooks";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import PN_ROUTES from "../navigation/routes";
import { dismissPnActivationReminderBanner } from "../store/actions";

type Props = {
  handleOnClose: () => void;
};

export const PNActivationReminderBanner = ({ handleOnClose }: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const closeHandler = useCallback(() => {
    dispatch(dismissPnActivationReminderBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

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
        onClose={closeHandler}
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
