import * as React from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { NewH6 } from "../core/typography/NewH6";
import {
  IOSelectionItemStyles,
  IOSelectionItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { AnimatedCheckbox } from "../core/selection/checkbox/AnimatedCheckbox";
import { LabelSmall } from "../core/typography/LabelSmall";
import { useIOTheme } from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons";

type Props = {
  value: string;
  description?: string;
  icon?: IOIcons;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof AnimatedCheckbox>, "disabled" | "checked"> &
  Pick<
    React.ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel"
  >;

/**
 *  with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
 */
export const CheckboxListItem = ({
  value,
  description,
  icon,
  checked,
  disabled,
  onValueChange
}: OwnProps) => {
  const [toggleValue, setToggleValue] = useState(checked ?? false);

  const theme = useIOTheme();

  const toggleCheckbox = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setToggleValue(!toggleValue);
    if (onValueChange !== undefined) {
      onValueChange(!toggleValue);
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={toggleCheckbox}
      testID="AnimatedCheckbox"
      style={{
        opacity: disabled ? DISABLED_OPACITY : 1
      }}
    >
      <View style={IOSelectionItemStyles.listItem}>
        <View style={IOSelectionItemStyles.listItemInner}>
          <View style={IOStyles.row}>
            {icon && (
              <View
                style={{ marginRight: IOSelectionItemVisualParams.iconMargin }}
              >
                <Icon
                  name={icon}
                  color="grey-300"
                  size={IOSelectionItemVisualParams.iconSize}
                />
              </View>
            )}
            <NewH6 color={"black"}>{value}</NewH6>
          </View>
          <HSpacer size={8} />
          <View pointerEvents="none">
            <AnimatedCheckbox checked={checked ?? toggleValue} />
          </View>
        </View>
        {description && (
          <View>
            <VSpacer size={4} />
            <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
              {description}
            </LabelSmall>
          </View>
        )}
      </View>
    </Pressable>
  );
};
