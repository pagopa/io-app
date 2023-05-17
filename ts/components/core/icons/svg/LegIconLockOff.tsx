import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconLockOff = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M11.316 16.777a1.666 1.666 0 1 1 1.666 0v1.89a.833.833 0 0 1-1.66.104l-.006-.104v-1.89Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.316 1.167a5.278 5.278 0 0 1 5.273 5.06l.004.218v3.61h8.223c1.073 0 1.944.871 1.944 1.945v8.889c0 1.074-.87 1.944-1.945 1.944H5.482a1.944 1.944 0 0 1-1.944-1.944V12c0-1.074.87-1.944 1.944-1.944h3.445V6.445a3.611 3.611 0 0 0-3.611-3.612 3.61 3.61 0 0 0-3.593 3.233l-.014.189-.005.19v1.444H.038V6.425l.005-.228a5.278 5.278 0 0 1 5.272-5.03Zm.166 10.555h13.334c.153 0 .277.125.277.278v8.889a.278.278 0 0 1-.277.278H5.482a.278.278 0 0 1-.278-.278V12c0-.153.125-.278.278-.278Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconLockOff;
