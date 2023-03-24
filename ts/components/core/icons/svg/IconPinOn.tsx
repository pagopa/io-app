import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconPinOn = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="m18.536.879 4.596 4.596a3 3 0 0 1 0 4.243c-1.04 1.04-2.476 1.077-3.632.422-.48-.272-1.11-.288-1.5.102l-1.154 1.154c-.306.307-.375.774-.21 1.176a8.572 8.572 0 0 1-1.878 9.298 2.43 2.43 0 0 1-3.437 0l-3.888-3.888-5.726 5.725a1 1 0 0 1-1.414-1.414l5.725-5.726L2.03 12.58a2.43 2.43 0 0 1 0-3.437 8.572 8.572 0 0 1 9.422-1.825c.405.172.881.107 1.193-.204L13.758 6c.39-.39.374-1.02.103-1.501-.648-1.154-.601-2.587.432-3.62a3 3 0 0 1 4.243 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconPinOn;
