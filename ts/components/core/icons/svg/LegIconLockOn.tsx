import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconLockOn = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M11.316 16.777a1.666 1.666 0 1 1 1.666 0v1.89a.833.833 0 0 1-1.66.104l-.006-.104v-1.89Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.877 6.197a5.278 5.278 0 0 1 10.545.019l.005.229v3.61h1.389c1.073 0 1.944.871 1.944 1.945v8.889c0 1.074-.87 1.944-1.945 1.944H5.482a1.944 1.944 0 0 1-1.944-1.944V12c0-1.074.87-1.944 1.944-1.944h1.39v-3.63l.005-.23Zm-1.395 5.525h13.334c.153 0 .277.125.277.278v8.889a.278.278 0 0 1-.277.278H5.482a.278.278 0 0 1-.278-.278V12c0-.153.125-.278.278-.278Zm10.274-5.448a3.611 3.611 0 0 0-3.607-3.44c-1.931 0-3.518 1.519-3.607 3.42l-.004.19v3.611h7.221l.001-3.591-.004-.19Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconLockOn;
