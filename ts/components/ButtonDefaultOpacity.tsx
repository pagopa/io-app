import { Button, NativeBase } from "native-base";
import * as React from "react";

const defaultActiveOpacity = 1.0;
/**
 * return Button component where the activeOpacity is 1.0 by default
 * instead of 0.2 https://github.com/facebook/react-native/blob/3042407f43b69994abc00350681f1f0a79683bfd/Libraries/Components/Touchable/TouchableOpacity.js#L149
 */
const ButtonDefaultOpacity = (
  props: NativeBase.Button & React.Props<Button>
) => {
  return (
    <Button
      {...{
        ...props,
        activeOpacity: props.activeOpacity || defaultActiveOpacity
      }}
      accessible={true} // allows with TalkBack the feedback request to touch for button activation
    >
      {props.children}
    </Button>
  );
};

export default ButtonDefaultOpacity;
