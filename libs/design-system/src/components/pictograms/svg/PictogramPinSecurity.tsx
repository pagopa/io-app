import { Svg, Path, Circle, Rect } from "react-native-svg";
import { SVGPictogramProps } from "../types";

const PictogramPinSecurity = ({
  size,
  colorValues,
  ...props
}: SVGPictogramProps) => (
  <Svg width={size} height={size} viewBox="0 0 240 240" {...props}>
    <Path
      fill={colorValues.main}
      d="M154 155a27 27 0 1 1 0 54H45a27 27 0 1 1 0-54h81v6l3 3 8-2 6-7z"
    />
    <Circle cx="44" cy="181" r="14" fill={colorValues.secondary} />
    <Circle cx="81" cy="181" r="14" fill={colorValues.secondary} />
    <Circle cx="118" cy="181" r="14" fill={colorValues.secondary} />
    <Circle cx="155" cy="181" r="14" fill={colorValues.secondary} />
    <Path
      fill={colorValues.main}
      d="M115 56a17 17 0 0 0-35 0v16H68V56a29 29 0 0 1 59 0v16h-12z"
    />
    <Path
      fill={colorValues.main}
      d="M120 68c20 0 37 17 37 38l-10 3-9 7-1 5 6 7-9 12q-6 3-14 3H77a37 37 0 1 1 0-75z"
    />
    <Rect
      width="13"
      height="29"
      x="90"
      y="90"
      fill={colorValues.secondary}
      rx="6.5"
    />
    <Path
      fill={colorValues.hands}
      fillRule="evenodd"
      d="M206 74c-1 0-15 17-50 43-2 2-25 24-29 40q-1 4 1 4h4c7-5 17-15 21-35l4 1-4 15q-1 3 3 7l3 1c-1-8 6-16 6-16l3 2s-6 8-5 14q1 4 6 7 13 4 16-2 2-4-3-9l-7 3-1-4s45-13 61-44l4 2q-6 15-39 35l-14 7q5 6 3 12-1 3-6 5-6 2-16-2-5-2-7-7-4 1-7-1l-3-5a51 51 0 0 1-17 18q-4 2-7-1-5-2-3-8 6-15 17-28-4-1-6-6-1-3 2-7c7-9 37-17 38-17q29-26 28-27zm-40 30c-10 4-23 9-27 13l-1 4q1 3 5 3l10-10z"
      clipRule="evenodd"
    />
  </Svg>
);

export default PictogramPinSecurity;
