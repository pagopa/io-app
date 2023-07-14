import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCheckTic = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L10.4142 18C9.63317 18.781 8.36684 18.7811 7.58579 18L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929C2.68342 10.9024 3.31658 10.9024 3.70711 11.2929L9 16.5858L20.2929 5.29289C20.6834 4.90237 21.3166 4.90237 21.7071 5.29289Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCheckTic;
