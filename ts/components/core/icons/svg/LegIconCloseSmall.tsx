import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconCloseSmall = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M8.156 15.833a.509.509 0 0 0 .754 0l2.823-3.025 2.823 3.025a.509.509 0 0 0 .755 0 .6.6 0 0 0 0-.809L12.487 12l2.822-3.025a.6.6 0 0 0 0-.808.509.509 0 0 0-.754 0l-2.823 3.025L8.91 8.167a.509.509 0 0 0-.754 0 .6.6 0 0 0 0 .808L10.98 12l-2.823 3.024a.6.6 0 0 0 0 .809Z"
      fill="currentColor"
    />
    <Path
      d="M8.156 15.833a.509.509 0 0 0 .754 0l2.823-3.025 2.823 3.025a.509.509 0 0 0 .755 0 .6.6 0 0 0 0-.809L12.487 12l2.822-3.025a.6.6 0 0 0 0-.808.509.509 0 0 0-.754 0l-2.823 3.025L8.91 8.167a.509.509 0 0 0-.754 0 .6.6 0 0 0 0 .808L10.98 12l-2.823 3.024a.6.6 0 0 0 0 .809Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconCloseSmall;
