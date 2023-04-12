import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconCheckOff = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.25 0H2.75C1.23122 0 0 1.23122 0 2.75v16.5C0 20.7688 1.23122 22 2.75 22h16.5c1.5188 0 2.75-1.2312 2.75-2.75V2.75C22 1.23122 20.7688 0 19.25 0ZM1.83333 2.75c0-.50626.41041-.91667.91667-.91667h16.5c.5063 0 .9167.41041.9167.91667v16.5c0 .5063-.4104.9167-.9167.9167H2.75c-.50626 0-.91667-.4104-.91667-.9167V2.75Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconCheckOff;
