import { ComponentPropsWithRef, FunctionComponent } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

const defaultActiveOpacity = 1.0;
export type TouchableDefaultOpacityProps = ComponentPropsWithRef<
  typeof TouchableOpacity & TouchableOpacityProps
>;
/**
 * return TouchableOpacity component where the activeOpacity is 1.0 by default
 * instead of 0.2 https://github.com/facebook/react-native/blob/3042407f43b69994abc00350681f1f0a79683bfd/Libraries/Components/Touchable/TouchableOpacity.js#L149
 */
const TouchableDefaultOpacity: FunctionComponent<
  TouchableDefaultOpacityProps
> = props => (
  <TouchableOpacity
    {...{
      ...props,
      activeOpacity: props.activeOpacity || defaultActiveOpacity
    }}
  >
    {props.children}
  </TouchableOpacity>
);

export default TouchableDefaultOpacity;
