import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEmail = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 2C2.23858 2 0 4.23858 0 7v10c0 2.7614 2.23858 5 5 5h14c2.7614 0 5-2.2386 5-5V7c0-2.76142-2.2386-5-5-5H5ZM3.70658 4.29237C4.09822 4.10495 4.53685 4 5 4h14c.4631 0 .9018.10495 1.2934.29237-.0002.00018-.0003.00035-.0005.00052L12 12.5858 3.70711 4.29289a.02574.02574 0 0 1-.00053-.00052ZM2.29237 5.70658C2.10495 6.09822 2 6.53685 2 7v10c0 1.6569 1.34315 3 3 3h14c1.6569 0 3-1.3431 3-3V7c0-.46315-.105-.90178-.2924-1.29342-.0001.00018-.0003.00035-.0005.00053L13.4142 14c-.781.781-2.0474.7811-2.8284 0L2.29289 5.70711l-.00052-.00053Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEmail;
