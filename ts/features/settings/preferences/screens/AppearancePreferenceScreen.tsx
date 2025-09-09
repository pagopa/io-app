import {
  ListItemHeader,
  RadioGroup,
  useIONewTypeface,
  useIOThemeContext,
  VStack
} from "@pagopa/io-app-design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { constVoid } from "fp-ts/lib/function";
import I18n from "i18next";
import { ReactElement, useState } from "react";
import { Appearance, useColorScheme, View } from "react-native";
import { FONT_PERSISTENCE_KEY } from "../../../../common/context/DSTypefaceContext";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  ColorModeChoice,
  THEME_PERSISTENCE_KEY
} from "../../../../hooks/useAppThemeConfiguration";
import {
  preferencesFontSet,
  preferencesThemeSet,
  TypefaceChoice
} from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import {
  trackAppearancePreferenceScreenView,
  trackAppearancePreferenceThemeUpdate,
  trackAppearancePreferenceTypefaceUpdate
} from "../../common/analytics";

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
  const [selectedColorMode, setSelectedColorMode] =
    useState<ColorModeChoice>("light");

  useFocusEffect(() => {
    trackAppearancePreferenceScreenView();
    AsyncStorage.getItem(THEME_PERSISTENCE_KEY)
      .then(value => {
        if (value !== null && value !== undefined) {
          setSelectedColorMode(value as ColorModeChoice);
        }
      })
      .catch(constVoid);
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

  const handleColorModeChange = (choice: ColorModeChoice) => {
    trackAppearancePreferenceThemeUpdate(choice, store.getState());
    AsyncStorage.setItem(THEME_PERSISTENCE_KEY, choice).finally(() => {
      dispatch(preferencesThemeSet(choice));
      setSelectedColorMode(choice);
      if (choice === "auto") {
        Appearance.setColorScheme(undefined);
        setTheme(systemColorScheme);
        return;
      }
      Appearance.setColorScheme(choice);
      setTheme(choice);
    });
  };

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
      id: "auto" as ColorModeChoice,
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
                text: "Beta",
                variant: "highlight"
              }
            }}
          />
          <RadioGroup<ColorModeChoice>
            type="radioListItem"
            items={colorModeOptions}
            selectedItem={selectedColorMode}
            onPress={handleColorModeChange}
          />
        </View>
      </VStack>
    </IOScrollViewWithLargeHeader>
  );
};

export default AppearancePreferenceScreen;
