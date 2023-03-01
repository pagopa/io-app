import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInitiatives = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.75 3.5H4a.5.5 0 0 0-.5.5v4.75a.5.5 0 0 0 .5.5h4.75a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5Zm0 11.25H4a.5.5 0 0 0-.5.5V20a.5.5 0 0 0 .5.5h4.75a.5.5 0 0 0 .5-.5v-4.75a.5.5 0 0 0-.5-.5Zm11.25 0h-4.75a.5.5 0 0 0-.5.5V20a.5.5 0 0 0 .5.5H20a.5.5 0 0 0 .5-.5v-4.75a.5.5 0 0 0-.5-.5ZM20 3.5h-4.75a.5.5 0 0 0-.5.5v4.75a.5.5 0 0 0 .5.5H20a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5ZM4 2a2 2 0 0 0-2 2v4.75a2 2 0 0 0 2 2h4.75a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm0 11.25a2 2 0 0 0-2 2V20a2 2 0 0 0 2 2h4.75a2 2 0 0 0 2-2v-4.75a2 2 0 0 0-2-2H4Zm9.25 2a2 2 0 0 1 2-2H20a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2h-4.75a2 2 0 0 1-2-2v-4.75Zm2-13.25a2 2 0 0 0-2 2v4.75a2 2 0 0 0 2 2H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4.75Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInitiatives;
