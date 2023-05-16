import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconAnalytics = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 22h18a1 1 0 0 1 0 2H5a5.006 5.006 0 0 1-5-5V1a1 1 0 0 1 2 0v18a3 3 0 0 0 3 3zm1.707-2.293A1 1 0 0 1 5 19v-7a1 1 0 1 1 2 0v7a1 1 0 0 1-.293.707zM10 10v9a1 1 0 0 0 2 0v-9a1 1 0 1 0-2 0zm5 9v-6a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0zm5-10v10a1 1 0 0 0 2 0V9a1 1 0 1 0-2 0zM6.707 8.707a1 1 0 1 1-1.414-1.414l3.586-3.586a3 3 0 0 1 4.242 0l2.172 2.17a1 1 0 0 0 1.414 0L22.293.294a1 1 0 0 1 1.414 1.414L18.12 7.293a3 3 0 0 1-4.242 0L11.707 5.12a1.025 1.025 0 0 0-1.414 0L6.707 8.707z"
      fill="currentColor"
    />
  </Svg>
);

export default IconAnalytics;
