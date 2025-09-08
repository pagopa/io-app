import { ComponentProps, useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import * as analytics from "../../common/analytics";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";

const styles = StyleSheet.create({
  containerList: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export const useServicesHomeBottomSheet = () => {
  const navigation = useIONavigation();

  const handleNavigateToServicesPreferencesScreen = useCallback(() => {
    analytics.trackServicesPreferencesSelected("preferences_services");
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES
    });
  }, [navigation]);

  const handleNavigateToSettingsScreen = useCallback(() => {
    analytics.trackServicesPreferencesSelected("profile_main");
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);

  const navigationListItems: ReadonlyArray<ComponentProps<typeof ListItemNav>> =
    [
      {
        value: I18n.t(
          "services.home.bottomSheet.content.servicesPreferences.value"
        ),
        description: I18n.t(
          "services.home.bottomSheet.content.servicesPreferences.description"
        ),
        testID: "navigate-to-services-preferences",
        onPress: handleNavigateToServicesPreferencesScreen
      },
      {
        value: I18n.t("services.home.bottomSheet.content.settings.value"),
        description: I18n.t(
          "services.home.bottomSheet.content.settings.description"
        ),
        testID: "navigate-to-settings-main",
        onPress: handleNavigateToSettingsScreen
      }
    ];

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: "",
    component: (
      <FlatList
        data={navigationListItems}
        keyExtractor={(item, index) => `${item.value}-${index}`}
        renderItem={({ item: { onPress, ...rest } }) => (
          <ListItemNav
            {...rest}
            onPress={e => {
              dismiss();
              onPress(e);
            }}
          />
        )}
        scrollEnabled={false}
        style={styles.containerList}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={<VSpacer size={16} />}
      />
    )
  });

  return {
    bottomSheet,
    dismiss,
    present
  };
};
