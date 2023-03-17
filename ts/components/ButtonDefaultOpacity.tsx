import { Button, NativeBase } from "native-base";
import * as React from "react";
import { Insets } from "react-native";
import {
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent
} from "react-native-gesture-handler";
import customVariables from "../theme/variables";
import { isIos } from "../utils/platform";
import { useScreenReaderEnabled } from "../utils/accessibility";
import { calculateSlop } from "./core/accessibility";

const defaultActiveOpacity = 1.0;

type CustomProps = {
  hasFullHitSlop?: boolean;
  onPressWithGestureHandler?: true;
};
type Props = NativeBase.Button & React.Props<Button> & CustomProps;

const slopsBySize: Record<"small" | "xsmall" | "default", number> = {
  small: calculateSlop(customVariables.btnSmallHeight),
  xsmall: calculateSlop(customVariables.btnXSmallHeight),
  default: calculateSlop(customVariables.btnHeight)
};

/**
 * This is a temporary solution to extend the touchable area using the existing theme system.
 * @param props
 */
const getSlopForCurrentButton = (props: Props): Insets => {
  const slop =
    slopsBySize[props.small ? "small" : props.xsmall ? "xsmall" : "default"];

  // We've applied a vertical-only hitSlop so far, we don't want to break any existing button
  const result = {
    top: slop,
    bottom: slop
  };

  // The hasFullHitSlop prop should eventually be deprecated, after testing each button
  return props.hasFullHitSlop
    ? {
        ...result,
        right: slop,
        left: slop
      }
    : result;
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
  const hitSlop = getSlopForCurrentButton(props);
  const isScreenReaderEnabled = useScreenReaderEnabled();

  // use the alternative handling only if is request by props AND is android
  // if the screenReader is active render common button or the button would not be pressable
  const tapGestureRequired =
    props.onPressWithGestureHandler && !isIos && !isScreenReaderEnabled;
  const buttonIsAccessible = props.accessible;

  const button = (
    <Button
      {...{
        ...props,
        activeOpacity: props.activeOpacity || defaultActiveOpacity
      }}
      onPress={tapGestureRequired ? undefined : props.onPress}
      accessible={buttonIsAccessible === undefined ? true : buttonIsAccessible} // allows with TalkBack the feedback request to touch for button activation
      accessibilityRole={"button"}
      accessibilityState={{ disabled: props.disabled }}
      hitSlop={hitSlop}
      testID={props.testID}
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
