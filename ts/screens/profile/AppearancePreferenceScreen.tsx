import {
  ListItemHeader,
  RadioGroup,
  VStack
} from "@pagopa/io-app-design-system";
import React, { ReactElement, useState } from "react";
import { View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";

type TypefaceChoice = "comfortable" | "traditional";

type ColorModeChoice = "system" | "dark" | "light";

/**
 * Display the appearance related settings
 * @param props
 * @constructor
 */
const AppearancePreferenceScreen = (): ReactElement => {
  const [selectedTypeface, setSelectedTypeface] =
    useState<TypefaceChoice>("comfortable");

  const [selectedColorMode, setSelectedColorMode] =
    useState<ColorModeChoice>("light");

  // Options for typeface
  const typefaceOptions = [
    {
      id: "comfortable" as TypefaceChoice,
      value: "Confortevole",
      description: "Progettato per una migliore leggibilità dei testi"
    },
    {
      id: "traditional" as TypefaceChoice,
      value: "Standard",
      description: "Lo stile di sempre, con forme strette e geometriche"
    }
  ];

  // Options for the color mode
  const colorModeOptions = [
    {
      id: "system" as ColorModeChoice,
      value: "Automatico",
      description: "Cambia in base alle impostazioni di sistema",
      disabled: true
    },
    {
      id: "dark" as ColorModeChoice,
      value: "Scuro",
      disabled: true
    },
    {
      id: "light" as ColorModeChoice,
      value: "Chiaro",
      disabled: true
    }
  ];

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      title={{
        label: I18n.t("profile.preferences.list.appearance.title")
      }}
      headerActionsProp={{ showHelp: true }}
    >
      <VStack space={24}>
        <View>
          <ListItemHeader label={"Stile carattere"} />
          <RadioGroup<TypefaceChoice>
            type="radioListItem"
            items={typefaceOptions}
            selectedItem={selectedTypeface}
            onPress={setSelectedTypeface}
          />
        </View>

        <View>
          <ListItemHeader
            label={"Tema"}
            endElement={{
              type: "badge",
              componentProps: {
                text: "In arrivo",
                variant: "info"
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
