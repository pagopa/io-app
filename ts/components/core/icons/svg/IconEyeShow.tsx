import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEyeShow = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 9.5A2.502 2.502 0 0 0 9.5 12c0 1.378 1.121 2.5 2.5 2.5 1.378 0 2.5-1.122 2.5-2.5 0-1.379-1.122-2.5-2.5-2.5Zm0 3.8a1.251 1.251 0 1 1 1.25-1.25c0 .689-.56 1.25-1.25 1.25Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Zm.05 8.8a3.754 3.754 0 0 1-3.75-3.75 3.754 3.754 0 0 1 3.75-3.75 3.754 3.754 0 0 1 3.75 3.75 3.754 3.754 0 0 1-3.75 3.75Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4c4.9 0 9.477 2.982 11.947 7.782.07.137.07.299 0 .436C21.477 17.018 16.899 20 12 20 7.1 20 2.523 17.018.053 12.218a.476.476 0 0 1 0-.436C2.523 6.982 7.101 4 12 4ZM1.5 12.082c2.228 4.127 6.232 6.682 10.5 6.682s8.271-2.555 10.5-6.682C20.271 7.954 16.268 5.4 12 5.4S3.728 7.954 1.5 12.082Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEyeShow;
