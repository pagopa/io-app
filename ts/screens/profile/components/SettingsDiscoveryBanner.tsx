import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import React, { createRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { hasUserAcknowledgedSettingsBannerSelector } from "../../../features/profileSettings/store/selectors";
import { setHasUserAcknowledgedSettingsBanner } from "../../../features/profileSettings/store/actions";

export const SettingsDiscoveryBanner = () => {
  const bannerRef = createRef<View>();
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const hasUserAcknowledgedSettingsBanner = useIOSelector(
    hasUserAcknowledgedSettingsBannerSelector
  );

  const setHasUserAcknowledgedSettingsBannerDispatch = useCallback(
    () => dispatch(setHasUserAcknowledgedSettingsBanner(true)),
    [dispatch]
  );

  const handleOnPress = () => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  };

  if (!hasUserAcknowledgedSettingsBanner) {
    return (
      <View style={styles.margins}>
        <Banner
          viewRef={bannerRef}
          content={I18n.t("settings.informativeBanner.content")}
          action={I18n.t("settings.informativeBanner.action")}
          pictogramName="settings"
          color="neutral"
          size="big"
          onClose={setHasUserAcknowledgedSettingsBannerDispatch}
          labelClose={I18n.t("global.buttons.close")}
          onPress={handleOnPress}
        />
      </View>
    );
  } else {
    return undefined;
  }
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
