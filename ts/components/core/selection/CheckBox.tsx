import * as React from "react";
import { useState } from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import IconFont from "../../ui/IconFont";
import { calculateSlop } from "../accessibility";
import { IOColors } from "../variables/IOColors";

type Props = {
  // the value of the checkbox
  checked: boolean;
  // dispatch the new value after the checkbox changes state
  onValueChange?: (newValue: boolean) => void;
};

const size = 24;

const offColor = IOColors.bluegrey;
const onColor = IOColors.blue;
const slop = calculateSlop(size);
const tickSize = size * 0.85;

const styles = StyleSheet.create({
  checkBox: {
    width: size,
    height: size,
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    borderWidth: 2,
    borderRadius: 4
  }
});

const getBorderColor = (value: boolean) => (value ? onColor : offColor);

/**
 * A checkbox that follows the style guidelines
 * The graphical size of the element is 24x24 but the touchable area is 48x48
 *
 * https://pagopa.invisionapp.com/console/IO-app---Library-ckcdil0710mt1014buxuo4u34/ckcdilqwl032g01xbh77f4i2m/play
 *
 * @param props : asdd
 * @constructor
 */
export const CheckBox: React.FunctionComponent<Props> = props => {
  const [toggleValue, setToggleValue] = useState(props.checked);

  return (
    <TouchableDefaultOpacity
      hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
      style={[styles.checkBox, { borderColor: getBorderColor(toggleValue) }]}
      onPress={() => {
        setToggleValue(!toggleValue);
        if (props.onValueChange !== undefined) {
          props.onValueChange(!toggleValue);
        }
      }}
    >
      {toggleValue && (
        <IconFont name={"io-tick-big"} size={tickSize} color={onColor} />
      )}
    </TouchableDefaultOpacity>
  );
};
