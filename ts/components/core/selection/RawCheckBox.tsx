import * as React from "react";
import { StyleSheet } from "react-native";
import TouchableDefaultOpacity, {
  TouchableDefaultOpacityProps
} from "../../TouchableDefaultOpacity";
import IconFont from "../../ui/IconFont";
import { calculateSlop } from "../accessibility";
import { IOColors } from "../variables/IOColors";

type Props = {
  // the value of the checkbox
  checked?: boolean;
};

type OwnProps = Props &
  Pick<TouchableDefaultOpacityProps, "disabled" | "onPress">;

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
 * A raw checkbox that follows the style guidelines without any state logic.
 * This can be used to implement a standard {@link CheckBox} or others custom logics.
 *
 * The graphical size of the element is 24x24 but the touchable area is 48x48
 *
 * https://pagopa.invisionapp.com/console/IO-app---Library-ckcdil0710mt1014buxuo4u34/ckcdilqwl032g01xbh77f4i2m/play
 *
 * @param props
 * @constructor
 */
export const RawCheckBox: React.FunctionComponent<OwnProps> = props => {
  const checked = props.checked ?? false;
  return (
    <TouchableDefaultOpacity
      disabled={props.disabled}
      onPress={props.onPress}
      hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
      style={[styles.checkBox, { borderColor: getBorderColor(checked) }]}
    >
      {checked && (
        <IconFont name={"io-tick-big"} size={tickSize} color={onColor} />
      )}
    </TouchableDefaultOpacity>
  );
};
