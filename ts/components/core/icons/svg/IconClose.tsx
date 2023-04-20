import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconClose = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M21.7071 3.70711c.3905-.39053.3905-1.02369 0-1.41422-.3905-.39052-1.0237-.39052-1.4142 0L12 10.5858 3.70711 2.29289c-.39053-.39052-1.02369-.39052-1.41422 0-.39052.39053-.39052 1.02369 0 1.41422L10.5858 12l-8.29291 8.2929c-.39052.3905-.39052 1.0237 0 1.4142.39053.3905 1.02369.3905 1.41422 0L12 13.4142l8.2929 8.2929c.3905.3905 1.0237.3905 1.4142 0 .3905-.3905.3905-1.0237 0-1.4142L13.4142 12l8.2929-8.29289Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconClose;
