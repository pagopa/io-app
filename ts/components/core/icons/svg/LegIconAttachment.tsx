import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconAttachment = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M12.5 24C8.364 24 5 20.636 5 16.5V6a1 1 0 1 1 2 0v10.5c0 3.032 2.467 5.5 5.5 5.5s5.5-2.468 5.5-5.5v-11C18 3.57 16.43 2 14.5 2S11 3.57 11 5.5v10c0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5V6a1 1 0 1 1 2 0v9.5c0 1.93-1.57 3.5-3.5 3.5S9 17.43 9 15.5v-10C9 2.468 11.467 0 14.5 0S20 2.468 20 5.5v11c0 4.136-3.364 7.5-7.5 7.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconAttachment;
