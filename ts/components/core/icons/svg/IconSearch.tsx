import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSearch = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2 11c0-4.97056 4.02944-9 9-9 4.9706 0 9 4.02944 9 9 0 4.9706-4.0294 9-9 9-4.97056 0-9-4.0294-9-9Zm9-11C4.92487 0 0 4.92487 0 11c0 6.0751 4.92487 11 11 11 2.6775 0 5.1316-.9566 7.0391-2.5468l4.2539 4.2539c.3906.3906 1.0237.3906 1.4143 0 .3905-.3905.3905-1.0237 0-1.4142l-4.254-4.2539C21.0434 16.1315 22 13.6775 22 11c0-6.07513-4.9249-11-11-11Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSearch;
