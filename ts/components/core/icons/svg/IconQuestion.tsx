import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconQuestion = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6 8c0-3.31371 2.68629-6 6-6 3.3137 0 6 2.68629 6 6 0 2.7248-1.8172 5.0278-4.3079 5.7583C12.3754 14.1446 11 15.2973 11 17v1c0 .5523.4477 1 1 1s1-.4477 1-1v-1c0-.5064.452-1.087 1.255-1.3225C17.5744 14.7039 20 11.6365 20 8c0-4.41828-3.5817-8-8-8-4.41828 0-8 3.58172-8 8 0 .55228.44772 1 1 1s1-.44772 1-1Zm7.5 14.5c0 .8284-.6716 1.5-1.5 1.5s-1.5-.6716-1.5-1.5.6716-1.5 1.5-1.5 1.5.6716 1.5 1.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconQuestion;
