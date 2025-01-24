import {
  ListItemHeader,
  RadioGroup,
  useIONewTypeface,
  VStack
} from "@pagopa/io-app-design-system";
import { ReactElement, useState } from "react";
import { View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";

type TypefaceChoice = "comfortable" | "standard";

type ColorModeChoice = "system" | "dark" | "light";

/**
 * Display the appearance related settings
 * @param props
 * @constructor
 */
const AppearancePreferenceScreen = (): ReactElement => {
  const { newTypefaceEnabled, setNewTypefaceEnabled } = useIONewTypeface();

  const selectedTypeface: TypefaceChoice = newTypefaceEnabled
    ? "comfortable"
    : "standard";

  const handleTypefaceChange = (choice: TypefaceChoice) => {
    setNewTypefaceEnabled(choice === "comfortable");
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
      ),
      disabled: true
    },
    {
      id: "light" as ColorModeChoice,
      value: I18n.t("profile.preferences.list.appearance.theme.light"),
      disabled: true
    },
    {
      id: "dark" as ColorModeChoice,
      value: I18n.t("profile.preferences.list.appearance.theme.dark"),
      disabled: true
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
            onPress={setSelectedColorMode}
          />
        </View>
      </VStack>
    </IOScrollViewWithLargeHeader>
  );
};

export default AppearancePreferenceScreen;
