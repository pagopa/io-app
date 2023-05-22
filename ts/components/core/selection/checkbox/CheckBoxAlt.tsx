import * as React from "react";
import { useState } from "react";
import { RawCheckBox } from "./RawCheckBox";
import { AnimatedCheckbox } from "./AnimatedCheckBox";

type Props = {
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

// disabled: the component is no longer touchable
// onPress:
type OwnProps = Props &
  Pick<React.ComponentProps<typeof RawCheckBox>, "disabled" | "checked">;

/**
 * A checkbox with the automatic state management that uses a {@link RawCheckBox}
 * The toggleValue change when a `onPress` event is received and dispatch the `onValueChange`.
 *
 * @param props
 * @constructor
 */
export const CheckBoxAlt = ({ onValueChange, checked, disabled }: OwnProps) => {
  const [toggleValue, setToggleValue] = useState(checked ?? false);

  return (
    <AnimatedCheckbox
      checked={toggleValue}
      disabled={disabled}
      onPress={() => {
        setToggleValue(!toggleValue);
        if (onValueChange !== undefined) {
          onValueChange(!toggleValue);
        }
      }}
    />
  );
};
