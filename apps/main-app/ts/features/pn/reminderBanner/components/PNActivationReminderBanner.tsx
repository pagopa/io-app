import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { sendBannerMixpanelEvents } from "../../analytics/activationReminderBanner";
import PN_ROUTES from "../../navigation/routes";
import { dismissPnActivationReminderBanner } from "../../store/actions";

type Props = {
  handleOnClose: () => void;
};

export const PNActivationReminderBanner = ({ handleOnClose }: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isFirstRender = useRef<boolean>(true);

  const maybeDispatchBannerShown = useCallback(() => {
    if (isFirstRender.current) {
      sendBannerMixpanelEvents.bannerShown();
      // eslint-disable-next-line functional/immutable-data
      isFirstRender.current = false;
    }
  }, [isFirstRender]);

  useFocusEffect(maybeDispatchBannerShown);

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
