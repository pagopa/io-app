import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSpid = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 24c6.629 0 12-5.371 12-12S18.629 0 12 0C5.375 0 0 5.371 0 12s5.375 12 12 12Zm.033-10.97c-.997 0-1.818-.336-2.463-1.014-.646-.674-.968-1.51-.968-2.507 0-1.001.322-1.83.964-2.492.64-.662 1.458-.992 2.458-.992.997 0 1.81.334 2.435 1.017.625.678.94 1.51.94 2.511 0 .993-.315 1.822-.94 2.484-.625.657-1.43.992-2.426.992Zm-3.431 4.905c0-1.001.322-1.83.96-2.492.64-.662 1.458-.992 2.467-.992.996 0 1.809.335 2.43 1.017.625.682.94 1.515.94 2.512l-6.797-.045Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSpid;
