import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { dismissPnActivationReminderBanner } from "../../store/actions";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";

type Props = {
  handleOnClose: () => void;
};

export const PNActivationReminderBanner = ({ handleOnClose }: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    sendBannerMixpanelEvents.bannerShown();
  });

  const closeHandler = useCallback(() => {
    sendBannerMixpanelEvents.bannerClose();
    dispatch(dismissPnActivationReminderBanner());
    handleOnClose();
  }, [dispatch, handleOnClose]);

  const navigateToActivationFlow = () => {
    sendBannerMixpanelEvents.bannerTap();
    navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.ACTIVATION_BANNER_FLOW
      }
    });
  };
  return (
    <View style={styles.margins}>
      <Banner
        testID="pn-banner"
        title={I18n.t("features.pn.reminderBanner.title")}
        content={I18n.t("features.pn.reminderBanner.body")}
        action={I18n.t("features.pn.reminderBanner.cta")}
        color="turquoise"
        onPress={navigateToActivationFlow}
        pictogramName="savingMoney"
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
