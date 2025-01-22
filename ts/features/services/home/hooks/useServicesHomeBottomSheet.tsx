import { ComponentProps, useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

type NavigationListItem = {
  value: string;
} & Pick<
  ComponentProps<typeof ListItemNav>,
  "description" | "onPress" | "testID"
>;

const styles = StyleSheet.create({
  containerList: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export const useServicesHomeBottomSheet = () => {
  const navigation = useIONavigation();

  const handleNavigateToServicesPreferencesScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_SERVICES
    });
  }, [navigation]);

  const handleNavigateToSettingsScreen = useCallback(() => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);

  const navigationListItems: ReadonlyArray<NavigationListItem> = [
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

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal({
    title: "",
    component: (
      <FlatList
        data={navigationListItems}
        keyExtractor={item => item.value}
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
