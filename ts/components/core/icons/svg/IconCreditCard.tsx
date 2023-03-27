import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCreditCard = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 7c0-2.76142 2.23858-5 5-5h14c2.7614 0 5 2.23858 5 5v10c0 2.7614-2.2386 5-5 5H5c-2.76142 0-5-2.2386-5-5V7Zm5-3C3.34315 4 2 5.34315 2 7v1h20V7c0-1.65685-1.3431-3-3-3H5Zm17 6H2v7c0 1.6569 1.34315 3 3 3h14c1.6569 0 3-1.3431 3-3v-7ZM4 16.5c0-.8284.67157-1.5 1.5-1.5s1.5.6716 1.5 1.5S6.32843 18 5.5 18 4 17.3284 4 16.5Zm5 0c0-.8284.67157-1.5 1.5-1.5h3c.8284 0 1.5.6716 1.5 1.5s-.6716 1.5-1.5 1.5h-3c-.82843 0-1.5-.6716-1.5-1.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCreditCard;
