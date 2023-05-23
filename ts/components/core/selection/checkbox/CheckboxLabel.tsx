import * as React from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { NewH6 } from "../../typography/NewH6";
import { IOStyles } from "../../variables/IOStyles";
import { HSpacer } from "../../spacer/Spacer";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

type Props = {
  label: string;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const DISABLED_OPACITY = 0.5;

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof AnimatedCheckbox>, "disabled" | "checked"> &
  Pick<React.ComponentProps<typeof Pressable>, "onPress">;

/**
 * A checkbox with the automatic state management that uses a {@link AnimatedCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
 */
export const CheckboxLabel = ({ label, checked, disabled }: OwnProps) => {
  const [toggleValue, setToggleValue] = useState(checked ?? false);

  const toggleCheckbox = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setToggleValue(!toggleValue);
  };

  return (
    <Pressable
      disabled={disabled}
      testID="AnimatedCheckbox"
      onPress={toggleCheckbox}
      style={{
        alignSelf: "flex-start",
        opacity: disabled ? DISABLED_OPACITY : 1
      }}
    >
      <View style={[IOStyles.row, IOStyles.alignCenter]}>
        <View pointerEvents="none">
          <AnimatedCheckbox checked={checked ?? toggleValue} />
        </View>
        <HSpacer size={8} />
        <NewH6 color={"black"}>{label}</NewH6>
      </View>
    </Pressable>
  );
};
