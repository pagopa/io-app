import * as React from "react";
import { RawCheckBox } from "./RawCheckBox";

type Props = {
  onPress?: () => void;
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
export const CheckBox: React.FunctionComponent<OwnProps> = props => (
  <RawCheckBox
    checked={props.checked}
    disabled={props.disabled}
    onPress={props.onPress}
  />
);
