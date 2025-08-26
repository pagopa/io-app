import {
  ListItemHeader,
  RadioGroup,
  useIONewTypeface,
  useIOThemeContext,
  VStack
} from "@pagopa/io-app-design-system";
import { ReactElement, useEffect, useState } from "react";
import { Appearance, useColorScheme, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import {
  preferencesFontSet,
  TypefaceChoice
} from "../../../../store/actions/persistedPreferences";
import { FONT_PERSISTENCE_KEY } from "../../../../common/context/DSTypefaceContext";
import {
  trackAppearancePreferenceScreenView,
  trackAppearancePreferenceTypefaceUpdate
} from "../../common/analytics";

type ColorModeChoice = "system" | "dark" | "light";

/**
 * Display the appearance related settings
 * @param props
 * @constructor
 */
const AppearancePreferenceScreen = (): ReactElement => {
  const store = useIOStore();
  const dispatch = useIODispatch();
  const { newTypefaceEnabled, setNewTypefaceEnabled } = useIONewTypeface();
  const { setTheme } = useIOThemeContext();
  const systemColorScheme = useColorScheme();

  useFocusEffect(() => {
    trackAppearancePreferenceScreenView();
  });

  const selectedTypeface: TypefaceChoice = newTypefaceEnabled
    ? "comfortable"
    : "standard";

  const handleTypefaceChange = (choice: TypefaceChoice) => {
    trackAppearancePreferenceTypefaceUpdate(choice, store.getState());
    AsyncStorage.setItem(FONT_PERSISTENCE_KEY, choice).finally(() => {
      dispatch(preferencesFontSet(choice));
      setNewTypefaceEnabled(choice === "comfortable");
    });
  };

  const [selectedColorMode, setSelectedColorMode] =
    useState<ColorModeChoice>("light");

  // Options for typeface
  const typefaceOptions = [
    {
      id: "comfortable" as TypefaceChoice,
      value: I18n.t(
        "profile.preferences.list.appearance.typefaceStyle.comfortable.title"
      ),
      description: I18n.t(
        "profile.preferences.list.appearance.typefaceStyle.comfortable.description"
      )
    },
    {
      id: "standard" as TypefaceChoice,
      value: I18n.t(
        "profile.preferences.list.appearance.typefaceStyle.standard.title"
      ),
      description: I18n.t(
        "profile.preferences.list.appearance.typefaceStyle.standard.description"
      )
    }
  ];

  // Options for the color mode
  const colorModeOptions = [
    {
      id: "system" as ColorModeChoice,
      value: I18n.t(
        "profile.preferences.list.appearance.theme.automatic.title"
      ),
      description: I18n.t(
        "profile.preferences.list.appearance.theme.automatic.description"
      )
    },
    {
      id: "light" as ColorModeChoice,
      value: I18n.t("profile.preferences.list.appearance.theme.light")
    },
    {
      id: "dark" as ColorModeChoice,
      value: I18n.t("profile.preferences.list.appearance.theme.dark")
    }
  ];

  useEffect(() => {
    console.log("hook", systemColorScheme);
  }, [systemColorScheme]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.preferences.list.appearance.title")
      }}
      description={I18n.t("profile.preferences.list.appearance.subtitle")}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
    >
      <VStack space={24}>
        <View>
          <ListItemHeader
            iconName="typeface"
            label={I18n.t(
              "profile.preferences.list.appearance.typefaceStyle.title"
            )}
          />
          <RadioGroup<TypefaceChoice>
            type="radioListItem"
            items={typefaceOptions}
            selectedItem={selectedTypeface}
            onPress={handleTypefaceChange}
          />
        </View>

        <View>
          <ListItemHeader
            iconName="theme"
            label={I18n.t("profile.preferences.list.appearance.theme.title")}
            endElement={{
              type: "badge",
              componentProps: {
                text: I18n.t(
                  "profile.preferences.list.appearance.theme.comingSoon"
                ),
                variant: "highlight"
              }
            }}
          />
          <RadioGroup<ColorModeChoice>
            type="radioListItem"
            items={colorModeOptions}
            selectedItem={selectedColorMode}
            onPress={(mode: ColorModeChoice) => {
              if (mode === "system") {
                Appearance.setColorScheme(undefined);
              }
              setTheme(mode === "system" ? systemColorScheme : mode);
              setSelectedColorMode(mode);
            }}
          />
        </View>
      </VStack>
    </IOScrollViewWithLargeHeader>
  );
};

export default AppearancePreferenceScreen;
