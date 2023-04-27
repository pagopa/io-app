import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconNavProfile = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 11.083c2.51 0 4.546-2.052 4.546-4.583S14.51 1.917 12 1.917c-2.51 0-4.545 2.052-4.545 4.583S9.49 11.083 12 11.083ZM12 12c-3.012 0-5.455-2.462-5.455-5.5S8.988 1 12 1s5.454 2.462 5.454 5.5S15.012 12 12 12Zm9.09 11c0-5.063-4.07-9.167-9.09-9.167S2.91 17.937 2.91 23H2c0-5.569 4.477-10.083 10-10.083S22 17.43 22 23h-.91Zm.91 0h-.91c0-5.063-4.07-9.167-9.09-9.167S2.91 17.937 2.91 23H2c0-5.569 4.477-10.083 10-10.083S22 17.43 22 23Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconNavProfile;
