import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconTransactions = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 0C2.23858 0 0 2.23858 0 5v14c0 2.7614 2.23858 5 5 5h14c2.7614 0 5-2.2386 5-5V5c0-2.76142-2.2386-5-5-5H5ZM2 5c0-1.65685 1.34315-3 3-3h14c1.6569 0 3 1.34315 3 3v14c0 1.6569-1.3431 3-3 3H5c-1.65685 0-3-1.3431-3-3V5Zm7.70714.29289c.39056.39053.39056 1.02369 0 1.41422L7.41424 9H19c.5523 0 1 .44772 1 1 0 .5523-.4477 1-1 1H5.00003c-.40446 0-.7691-.2436-.92388-.6173-.15478-.3737-.06923-.80381.21677-1.08981l4-4c.39053-.39052 1.02369-.39052 1.41422 0ZM14.2929 18.7071c-.3906-.3905-.3906-1.0237 0-1.4142L16.5858 15H4.99997c-.55228 0-1-.4477-1-1s.44772-1 1-1H19c.4044 0 .7691.2436.9239.6173.1547.3737.0692.8038-.2168 1.0898l-4 4c-.3905.3905-1.0237.3905-1.4142 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconTransactions;
