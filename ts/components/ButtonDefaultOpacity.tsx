import { Button, NativeBase } from "native-base";
import * as React from "react";
import customVariables from "../theme/variables";

const defaultActiveOpacity = 1.0;

type Props = NativeBase.Button & React.Props<Button>;

/**
 *
 * @param height
 */
const calculateSlop = (height: number): number => {
  const additionalArea = customVariables.minTouchableHeight - height;
  if (additionalArea <= 0) {
    return 0;
  }
  return Math.ceil(additionalArea / 2);
};

const smallSlop = calculateSlop(customVariables.btnSmallHeight);
const xsmallSlop = calculateSlop(customVariables.btnXSmallHeight);
const defaultSlop = calculateSlop(customVariables.btnHeight);
/**
 * This is a temporary solution to extend the touchable area using the existing theme system.
 * @deprecated
 * @param props
 */
const getSlopForCurrentButton = (props: Props) => {
  if (props.small) {
    return smallSlop;
  } else if (props.xsmall) {
    return xsmallSlop;
  }
  return defaultSlop;
};

/**
 * return Button component where the activeOpacity is 1.0 by default
 * instead of 0.2 https://github.com/facebook/react-native/blob/3042407f43b69994abc00350681f1f0a79683bfd/Libraries/Components/Touchable/TouchableOpacity.js#L149
 */
const ButtonDefaultOpacity = (props: Props) => {
  const slop = getSlopForCurrentButton(props);
  return (
    <Button
      {...{
        ...props,
        activeOpacity: props.activeOpacity || defaultActiveOpacity
      }}
      accessible={true} // allows with TalkBack the feedback request to touch for button activation
      accessibilityRole={"button"}
      hitSlop={{ top: slop, bottom: slop }}
    >
      {props.children}
    </Button>
  );
};

export default ButtonDefaultOpacity;
