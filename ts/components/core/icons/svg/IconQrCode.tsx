import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconQrCode = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M8.996 8.996H0V0h8.996v8.996ZM0 10.5v3h4.5V12H3v-1.5H0ZM8.996 24v-9H0v9h8.996ZM7.5 1.5h-6v6h6v-6Zm0 15v6h-6v-6h6ZM6 3v3H3V3h3ZM3 20.996h3V18H3v2.996Zm1.5-9h3V10.5h-3v1.497Zm4.5 0H7.5v1.5h3v-2.997H8.995L9 11.996Zm4.5-10.5H12V0h-1.5v6H12V4.5h1.5V1.495Zm-3 9.003H12V8.996h-1.5V10.5Zm0 6h3v-3h-3v3Zm0 1.501v1.5H12v1.496h1.5V18h-3Zm0 6H12v-3.004h-1.5V24ZM12 8.996h1.5V6H12v2.996Zm1.5 4.5h3v-2.997H12V12h1.5v1.496Zm0 4.5H15V16.5h-1.5v1.497Zm0 6h3v-3h-3v3Zm1.5-15h9V0h-9v8.996Zm0 7.5h4.5v-2.997h-3V15H15v1.496Zm0 3h1.5V18H15v1.496Zm1.5-12v-6h6v6h-6Zm0 13.5H18V19.5h-1.5v1.497Zm1.5-15h2.996V3H18v2.996Zm0 6h2.996v1.5h3v-2.997h-6L18 11.996Zm0 7.5h2.996V18H18v1.496Zm0 4.5h1.5v-3H18v3Zm2.996-7.497H22.5V18H24v-3h-3.004v1.5Zm0 3V24h3v-3.004H22.5V19.5h-1.503Z"
      fill={color}
    />
  </Svg>
);

export default IconQrCode;
