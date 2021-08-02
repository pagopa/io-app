import * as React from "react";
import { useState } from "react";
import { RawCheckBox } from "./RawCheckBox";

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
export const CheckBox: React.FunctionComponent<OwnProps> = props => {
  const [toggleValue, setToggleValue] = useState(props.checked ?? false);

  return (
    <RawCheckBox
      checked={toggleValue}
      disabled={props.disabled}
      onPress={() => {
        setToggleValue(!toggleValue);
        if (props.onValueChange !== undefined) {
          props.onValueChange(!toggleValue);
        }
      }}
    />
  );
};
