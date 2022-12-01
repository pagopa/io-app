import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../Pictogram";

const Completed = ({ size, color, ...props }: SVGPictogramProps) => (
  <Svg fill="none" width={size} height={size} viewBox="0 0 120 120" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.452 60.01C.452 27.2 27.147.507 59.957.507s59.504 26.695 59.504 59.505-26.695 59.504-59.504 59.504C27.147 119.515.452 92.82.452 60.01Zm5.946 0c0 29.534 24.025 53.559 53.559 53.559 29.533 0 53.558-24.025 53.558-53.559 0-29.533-24.025-53.558-53.558-53.558-29.534 0-53.559 24.025-53.559 53.559Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m75.536 45.523-22.811 22.69L44.4 59.84a2.98 2.98 0 0 0-4.198-.025c-1.165 1.14-1.165 3.034-.025 4.199L50.59 74.498a2.956 2.956 0 0 0 4.199 0L79.71 49.721a2.98 2.98 0 0 0 .025-4.198 2.959 2.959 0 0 0-4.199 0Z"
      fill={color}
    />
  </Svg>
);

export default Completed;
