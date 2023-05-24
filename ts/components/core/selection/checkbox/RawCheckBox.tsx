import * as React from "react";
import { StyleSheet, View } from "react-native";
import TouchableDefaultOpacity, {
  TouchableDefaultOpacityProps
} from "../../../TouchableDefaultOpacity";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { IOIconSizeScaleCheckbox, Icon } from "../../icons/Icon";

type Props = {
  // the value of the checkbox
  checked?: boolean;
};

type OwnProps = Props &
  Pick<TouchableDefaultOpacityProps, "disabled" | "onPress">;

const SIZE: number = 24;
const BORDER_WIDTH: number = 2;
const INTERNAL_PADDING: number = 3;

const offColor: IOColors = "bluegrey";
const onColor: IOColors = "blue";
const slop = calculateSlop(SIZE);
/* SIZE - INTERNAL_PADDING * 2; */
const tickSize: IOIconSizeScaleCheckbox = 18;

const styles = StyleSheet.create({
  checkBox: {
    width: SIZE,
    height: SIZE,
    backgroundColor: IOColors.white,
    borderColor: IOColors.blue,
    borderWidth: BORDER_WIDTH,
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
      testID="RawCheckbox"
      onPress={props.onPress}
      hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
      style={[
        styles.checkBox,
        { borderColor: IOColors[getBorderColor(checked)] }
      ]}
    >
      {checked && (
        <View
          style={{
            top: -BORDER_WIDTH,
            left: -BORDER_WIDTH,
            padding: INTERNAL_PADDING
          }}
        >
          <Icon name="completed" size={tickSize} color={onColor} />
        </View>
      )}
    </TouchableDefaultOpacity>
  );
};
