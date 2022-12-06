import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconBattery = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9.262.389 8.05 2.812H7.1A2.134 2.134 0 0 0 4.97 4.944v16.924C4.969 23.044 5.925 24 7.1 24h9.798a2.134 2.134 0 0 0 2.132-2.132V4.944A2.134 2.134 0 0 0 16.9 2.813h-.949L14.738.389A.703.703 0 0 0 14.11 0H9.891c-.267 0-.51.15-.63.389Zm7.637 3.83c.4 0 .726.325.726.725v16.924c0 .4-.326.726-.726.726H7.101a.726.726 0 0 1-.726-.726V4.944c0-.4.325-.725.726-.725h9.798Zm-3.224-2.813.703 1.407H9.622l.703-1.407h3.35Z"
      fill={color}
    />
    <Path
      d="M14.828 13.22a1 1 0 0 0-.828-.439h-2.523l1.451-3.628a1 1 0 0 0-1.857-.743l-2 5A1 1 0 0 0 10 14.78h2.523l-1.451 3.629a1 1 0 0 0 1.857.743l2-5a1 1 0 0 0-.1-.932Z"
      fill={color}
    />
  </Svg>
);

export default IconBattery;
