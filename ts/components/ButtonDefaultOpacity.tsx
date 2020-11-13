import { Button, NativeBase } from "native-base";
import * as React from "react";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { fromNullable } from "fp-ts/lib/Option";
import customVariables from "../theme/variables";
import { calculateSlop } from "./core/accessibility";

const defaultActiveOpacity = 1.0;

type CustomProps = {
  wrapWithTouchableWithoutFeedback?: true;
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
 */
const ButtonDefaultOpacity = (props: Props) => {
  const wrapChildren = (children: React.ReactNode) =>
    fromNullable(props.wrapWithTouchableWithoutFeedback).fold(children, _ => (
      <TouchableWithoutFeedback onPress={props.onPress}>
        {children}
      </TouchableWithoutFeedback>
    ));

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
      {wrapChildren(props.children)}
    </Button>
  );
};

export default ButtonDefaultOpacity;
