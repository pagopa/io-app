import { useState } from "react";
import { View } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { Icon } from "../icons";
import { HStack } from "../layout";
import { Radio } from "../radio/Radio";
import { BodySmall, H6 } from "../typography";
import { PressableListItemBase } from "./PressableListItemBase";

export type ListItemRadioWithAmountProps = {
  accessibilityLabel?: string;
  formattedAmountString: string;
  label: string;
  onValueChange?: (newValue: boolean) => void;
  selected?: boolean;
} & (
  | {
      isSuggested?: false;
      suggestReason?: never;
    }
  | {
      isSuggested?: true;
      suggestReason: string;
    }
);
export const ListItemRadioWithAmount = ({
  onValueChange,
  selected,
  label,
  accessibilityLabel,
  isSuggested = false,
  suggestReason,
  formattedAmountString
}: ListItemRadioWithAmountProps) => {
  const { dynamicFontScale } = useIOFontDynamicScale();
  const [toggleValue, setToggleValue] = useState(selected ?? false);

  const pressHandler = () => {
    setToggleValue(val => !val);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };
  const listItemColors = useIOColors().component.listItem;

  const defaultAccessibilityLabel = `${label} ${formattedAmountString} ${
    suggestReason ?? ""
  }`;

  return (
    <PressableListItemBase
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected ?? toggleValue
      }}
      onPress={pressHandler}
    >
      <View style={{ flexShrink: 1 }}>
        <H6 color={listItemColors.label} numberOfLines={1}>
          {label}
        </H6>
        {isSuggested && (
          <HStack
            space={IODimensions.gap.selection.caption}
            style={{ alignItems: "center" }}
          >
            <Icon
              color={listItemColors.featured}
              name="sparkles"
              size={IODimensions.size.icon.caption}
            />
            <BodySmall color={listItemColors.featured} weight="Regular">
              {suggestReason}
            </BodySmall>
          </HStack>
        )}
      </View>
      <HStack
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        space={IODimensions.gap.selection.control}
      >
        <H6 color={listItemColors.amount}>{formattedAmountString}</H6>
        <Radio
          checked={selected ?? toggleValue}
          size={IODimensions.size.selection.control * dynamicFontScale}
        />
      </HStack>
    </PressableListItemBase>
  );
};
