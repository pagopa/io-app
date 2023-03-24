import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconWarning = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M10.5 16.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 14c-.414 0-.75-.358-.75-.8l-.696-5.197A1.698 1.698 0 0 1 10.5 7.6c0-.884.671-1.6 1.5-1.6s1.5.716 1.5 1.6c0 .14-.023.274-.054.403L12.75 13.2c0 .442-.336.8-.75.8Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0Zm0 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
      fill="currentColor"
    />
    <Path
      d="M10.5 16.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 14c-.414 0-.75-.358-.75-.8l-.696-5.197A1.698 1.698 0 0 1 10.5 7.6c0-.884.671-1.6 1.5-1.6s1.5.716 1.5 1.6c0 .14-.023.274-.054.403L12.75 13.2c0 .442-.336.8-.75.8Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0Zm0 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconWarning;
