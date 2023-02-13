import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconLogin = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M15.913 12.783H.783a.783.783 0 0 1 0-1.566h15.13a.783.783 0 0 1 0 1.566Z"
      fill="currentColor"
    />
    <Path
      d="M11.74 16.957a.783.783 0 0 1-.553-1.337l3.62-3.62-3.621-3.622a.783.783 0 0 1 1.107-1.107l4.174 4.174a.783.783 0 0 1 0 1.107l-4.174 4.174a.777.777 0 0 1-.554.23Z"
      fill="currentColor"
    />
    <Path
      d="M12.522 23.478c-4.75 0-8.942-2.857-10.683-7.28a.782.782 0 1 1 1.456-.57 9.863 9.863 0 0 0 9.227 6.285c5.465 0 9.913-4.447 9.913-9.913s-4.448-9.913-9.913-9.913a9.863 9.863 0 0 0-9.227 6.286.782.782 0 1 1-1.457-.572C3.58 3.38 7.774.521 12.523.521 18.85.522 24 5.672 24 12.002c0 6.328-5.15 11.477-11.478 11.477Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconLogin;
