import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconDocumentAdd = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      d="M5.065 2.5a.532.532 0 0 0-.532.532v3.501H1.032a.532.532 0 0 0 0 1.064h3.5v3.502a.532.532 0 0 0 1.064 0V7.597h3.502a.532.532 0 0 0 0-1.064H5.596V3.032a.532.532 0 0 0-.531-.532Z"
    />
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M4.033 3.032a1.032 1.032 0 0 1 2.063 0v3.001h3.002a1.032 1.032 0 0 1 0 2.064H6.096v3.002a1.032 1.032 0 1 1-2.063 0V8.097H1.032a1.032 1.032 0 0 1 0-2.064h3V3.032ZM5.065 3a.032.032 0 0 0-.032.032v4.001H1.032a.032.032 0 0 0 0 .064h4v4.002a.032.032 0 1 0 .064 0V7.097h4.002a.032.032 0 0 0 0-.064H5.096V3.032A.032.032 0 0 0 5.065 3Z"
      clipRule="evenodd"
    />
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.845 5.5H20.3a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V13h2v6.5a1 1 0 0 0 1 1h13.3a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1h-9.455v-2Z"
      clipRule="evenodd"
    />
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M15.5 16.5h-8v-2h8v2ZM18.5 19.5h-11v-2h11v2Z"
      clipRule="evenodd"
    />
    <Path
      fill="currentColor"
      d="M19.5 11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
  </Svg>
);

export default IconDocumentAdd;
