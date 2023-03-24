import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconHourglass = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 1a1 1 0 0 1 1-1h22a1 1 0 1 1 0 2h-2v3.444c0 2.457-.874 4.707-2.322 6.407a.23.23 0 0 0-.05.149.23.23 0 0 0 .05.15C20.127 13.848 21 16.098 21 18.555V22h2a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2h2v-3.444c0-2.457.874-4.707 2.321-6.407A.23.23 0 0 0 5.372 12a.23.23 0 0 0-.05-.15C3.873 10.152 3 7.902 3 5.445V2H1a1 1 0 0 1-1-1Zm5 1v3.444c0 1.979.703 3.77 1.844 5.11a2.244 2.244 0 0 1 0 2.892C5.704 14.786 5 16.577 5 18.556V22h14v-3.444c0-1.979-.703-3.77-1.844-5.11a2.244 2.244 0 0 1 0-2.892C18.296 9.214 19 7.423 19 5.444V2H5Zm3 5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm3 3a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconHourglass;
