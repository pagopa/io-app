import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconHistory = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.555 16.97a1.036 1.036 0 0 1 1.458.128 7.933 7.933 0 0 0 13.734-3.047c1.132-4.224-1.383-8.58-5.606-9.712-4.224-1.131-8.581 1.384-9.713 5.608a7.934 7.934 0 0 0-.272 1.956l2.23-1.871a1.034 1.034 0 1 1 1.33 1.585L5.017 14.72c-.437.367-1.09.31-1.457-.128L.457 10.895a1.034 1.034 0 0 1 1.585-1.33l1.107 1.32a10 10 0 0 1 17.01-5.956 9.998 9.998 0 0 1 2.587 9.657 9.928 9.928 0 0 1-4.66 6.072 10 10 0 0 1-12.66-2.232 1.034 1.034 0 0 1 .129-1.456Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5 13V8h2v4.585l2.207 2.208-1.414 1.414-2.5-2.5A1 1 0 0 1 11.5 13Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconHistory;
