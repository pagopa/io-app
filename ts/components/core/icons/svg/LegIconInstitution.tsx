import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconInstitution = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M23.062 10.188c.518 0 .938-.42.938-.938V6.5c0-.354-.2-.678-.517-.837L12.421.1a.938.938 0 0 0-.842 0L.517 5.663A.937.937 0 0 0 0 6.5v2.75c0 .518.42.938.938.938h.875v8.252a.937.937 0 0 0-.846.704L.029 22.83A.938.938 0 0 0 .938 24h22.124c.61 0 1.06-.576.909-1.169l-.938-3.687a.937.937 0 0 0-.877-.705v-8.251h.906ZM1.875 7.078 12 1.988l10.125 5.09v1.235H1.875V7.078Zm6.438 11.36v-8.25h7.343v8.25H8.313Zm-1.875-8.25v8.25h-2.75v-8.25h2.75ZM2.143 22.125l.461-1.813h18.792l.46 1.813H2.143Zm18.138-3.688h-2.75v-8.25h2.75v8.25Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconInstitution;
