import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconBattery = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0c-1.4806 0-2.77325.8044-3.46487 2H8C6.34315 2 5 3.34315 5 5v16c0 1.6569 1.34315 3 3 3h8c1.6569 0 3-1.3431 3-3V5c0-1.65685-1.3431-3-3-3h-.5351C14.7733.8044 13.4806 0 12 0Zm2 4H8c-.55228 0-1 .44772-1 1v16c0 .5523.44772 1 1 1h8c.5523 0 1-.4477 1-1V5c0-.55228-.4477-1-1-1h-2Zm-1.6286 3.0713c.5128.20511.7622.78709.5571 1.29987L11.477 11.9998H14c.3318 0 .642.1646.8281.4393.186.2748.2236.624.1004.9321l-2 5c-.2051.5128-.7871.7622-1.2999.5571-.5128-.2052-.7622-.7871-.5571-1.2999l1.4515-3.6286H10a.99995.99995 0 0 1-.82806-.4394.99996.99996 0 0 1-.10041-.932l1.99997-5.00001c.2051-.51279.7871-.7622 1.2999-.55709Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconBattery;
