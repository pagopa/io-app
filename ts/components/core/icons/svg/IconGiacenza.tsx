import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconGiacenza = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 2C3.34315 2 2 3.34315 2 5v14c0 1.6569 1.34315 3 3 3h14c1.6569 0 3-1.3431 3-3v-9h-5c-1.6569 0-3-1.34315-3-3V2H5Zm11 .49902V7c0 .55229.4477 1 1 1h4.501a3.00025 3.00025 0 0 0-.3797-.46447l-4.6568-4.65685A3.00388 3.00388 0 0 0 16 2.49902ZM0 5c0-2.76142 2.23858-5 5-5h9.3431c1.3261 0 2.5979.52678 3.5356 1.46447l4.6568 4.65685A4.99995 4.99995 0 0 1 24 9.65685V19c0 2.7614-2.2386 5-5 5H5c-2.76142 0-5-2.2386-5-5V5Zm5 1.5C5 5.67157 5.67157 5 6.5 5h3c.8284 0 1.5.67157 1.5 1.5S10.3284 8 9.5 8h-3C5.67157 8 5 7.32843 5 6.5ZM6 13c-.55228 0-1 .4477-1 1s.44772 1 1 1h12c.5523 0 1-.4477 1-1s-.4477-1-1-1H6Zm-1 5c0-.5523.44772-1 1-1h12c.5523 0 1 .4477 1 1s-.4477 1-1 1H6c-.55228 0-1-.4477-1-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconGiacenza;
