import { HeaderActionProps } from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import I18n from "i18next";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { SETTINGS_ROUTES } from "../features/settings/common/navigation/routes";

export const useNavigateToSettingMainScreen = () => {
  const navigation = useIONavigation();

  return useCallback(() => {
    navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
      screen: SETTINGS_ROUTES.SETTINGS_MAIN
    });
  }, [navigation]);
};

/**
 * This hook returns a prop object to be applied to the `HeaderFirstLevel`
 */
export const useHeaderFirstLevelActionPropSettings = (): HeaderActionProps => ({
  icon: "coggle",
  accessibilityLabel: I18n.t("global.buttons.settings"),
  onPress: useNavigateToSettingMainScreen()
});
