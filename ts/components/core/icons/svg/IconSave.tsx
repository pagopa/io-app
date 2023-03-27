import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSave = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.7071 8.29289c.3905.39053.3905 1.02369 0 1.41422l-6 5.99999c-.3905.3905-1.0237.3905-1.4142 0L5.29289 9.70711c-.39052-.39053-.39052-1.02369 0-1.41422.39053-.39052 1.02369-.39052 1.41422 0L11 12.5858V1c0-.55228.4477-1 1-1s1 .44772 1 1v11.5858l4.2929-4.29291c.3905-.39052 1.0237-.39052 1.4142 0ZM2 18c0-.5523-.44772-1-1-1-.55229 0-1 .4477-1 1v1c0 2.7619 2.24066 5 5.00157 5H18.9984C21.7593 24 24 21.7619 24 19v-1c0-.5523-.4477-1-1-1s-1 .4477-1 1v1c0 1.6563-1.3442 3-3.0016 3H5.00157C3.3442 22 2 20.6563 2 19v-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSave;
