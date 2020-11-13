import { Button, NativeBase } from "native-base";
import * as React from "react";
import {
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent
} from "react-native-gesture-handler";
import customVariables from "../theme/variables";
import { isIos } from "../utils/platform";
import { calculateSlop } from "./core/accessibility";

const defaultActiveOpacity = 1.0;

type CustomProps = {
  onPressWithGestureHandler?: true;
};
type Props = NativeBase.Button & React.Props<Button> & CustomProps;

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
 *
 * In certain cases on Android devices, the native-base button doesn't dispatch the onPress event
 * Because of this, on Android, we wrap the button in a TapGestureHandler and the onPress is handled manually
 * (this surely happen when a button is used inside a BottomSheet)
 */
const ButtonDefaultOpacity = (props: Props) => {
  const slop = getSlopForCurrentButton(props);
  // use the alternative handling only if is request by props AND is android
  const tapGestureRequired = props.onPressWithGestureHandler && !isIos;
  const button = (
    <Button
      {...{
        ...props,
        activeOpacity: props.activeOpacity || defaultActiveOpacity
      }}
      onPress={tapGestureRequired ? undefined : props.onPress}
      accessible={true} // allows with TalkBack the feedback request to touch for button activation
      accessibilityRole={"button"}
      hitSlop={{ top: slop, bottom: slop }}
    >
      {props.children}
    </Button>
  );

  return tapGestureRequired ? (
    <TapGestureHandler
      onHandlerStateChange={(event: TapGestureHandlerStateChangeEvent) => {
        // call on press when touch ends
        if (props.onPress && event.nativeEvent.state === State.END) {
          props.onPress();
        }
      }}
    >
      {button}
    </TapGestureHandler>
  ) : (
    button
  );
};

export default ButtonDefaultOpacity;
