import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../Pictogram";

const SectionPictogramSmile = ({
  size,
  color,
  ...props
}: SVGPictogramProps) => (
  <Svg fill="none" width={size} height={size} viewBox="0 0 48 48" {...props}>
    <Path
      d="M15.276 9.462a3.455 3.455 0 0 1-3.448 3.461A3.455 3.455 0 0 1 8.38 9.462 3.455 3.455 0 0 1 11.828 6a3.455 3.455 0 0 1 3.448 3.462ZM39.38 9.462a3.455 3.455 0 0 1-3.449 3.461 3.455 3.455 0 0 1-3.448-3.461A3.455 3.455 0 0 1 35.931 6a3.455 3.455 0 0 1 3.449 3.462ZM45.05 27.795a1.38 1.38 0 0 0-1.876.534c-3.86 6.938-10.966 11.292-18.794 11.292-7.828 0-14.934-4.354-18.795-11.292a1.38 1.38 0 1 0-2.41 1.342C7.512 37.467 15.53 42.379 24.38 42.379c8.849 0 16.866-4.912 21.205-12.708a1.38 1.38 0 0 0-.535-1.876Z"
      fill={color}
    />
  </Svg>
);

export default SectionPictogramSmile;
