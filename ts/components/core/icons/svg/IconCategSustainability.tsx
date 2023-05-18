import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCategSustainability = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M23.231 1.474a.75.75 0 0 0-.705-.705C22.093.743 11.84.209 6.22 5.829a8.445 8.445 0 0 0-.505 11.4L.97 21.968a.749.749 0 1 0 1.06 1.061l4.746-4.745a8.445 8.445 0 0 0 11.396-.505c5.62-5.62 5.085-15.873 5.06-16.306Zm-6.12 15.246a6.96 6.96 0 0 1-9.27.5L10.06 15h4.189a.75.75 0 1 0 0-1.5h-2.69l6.22-6.22a.75.75 0 0 0-1.06-1.06l-3.97 3.97V7.5a.75.75 0 1 0-1.5 0v4.19l-4.47 4.47a6.96 6.96 0 0 1 .5-9.271c4.35-4.35 12.115-4.66 14.47-4.639.014 2.347-.29 10.12-4.639 14.47Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCategSustainability;
