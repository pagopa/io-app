import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconFiscalCodeIndividual = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 4H4c-1.10457 0-2 .89543-2 2v12c0 1.1046.89543 2 2 2h16c1.1046 0 2-.8954 2-2V6c0-1.10457-.8954-2-2-2ZM4 2C1.79086 2 0 3.79086 0 6v12c0 2.2091 1.79086 4 4 4h16c2.2091 0 4-1.7909 4-4V6c0-2.20914-1.7909-4-4-4H4Zm9.9991 8c0-.55228.4477-1 1-1h2c.5523 0 1 .44772 1 1 0 .5523-.4477 1-1 1h-2c-.5523 0-1-.4477-1-1Zm1 3c-.5523 0-1 .4477-1 1s.4477 1 1 1h4c.5523 0 1-.4477 1-1s-.4477-1-1-1h-4Zm-5.06166-.5003c.45246-.4779.72986-1.123.72986-1.833C10.6673 9.19391 9.47341 8 8.00065 8c-1.47276 0-2.66667 1.19391-2.66667 2.6667 0 .7097.27729 1.3547.72943 1.8325-1.13883.6314-1.93712 1.8023-2.04973 3.1676-.01513.1834.13556.3332.31965.3332h7.33337c.1841 0 .3347-.1498.3196-.3332-.1126-1.365-.9105-2.5357-2.04886-3.1671Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconFiscalCodeIndividual;
