import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconPinOn = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="m21.075 9.525-6.6-6.6c-.3-.3-.75-.3-1.05 0l-2.4 2.4c-.375.375-.225.825 0 1.05l.525.525L9.3 9.15c-1.125-.225-4.2-.75-5.85.9-.3.3-.3.75 0 1.05l4.275 4.275L3 20.1c-.3.3-.3.75 0 1.05.3.3.825.225 1.05 0l4.725-4.725L13.05 20.7c.45.375.9.225 1.05 0 1.65-1.65 1.125-4.725.9-5.85l2.25-2.25.525.525c.3.3.75.3 1.05 0l2.4-2.4c.15-.45.15-.9-.15-1.2Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconPinOn;
