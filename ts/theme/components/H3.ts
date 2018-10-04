import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h3FontWeight),
    color: variables.h3Color,
    fontSize: variables.h3FontSize,
    lineHeight: variables.h3LineHeight,
    ".inMessage": {
      marginTop: variables.fontSizeBase * 1.5,
      marginBottom: variables.fontSizeBase * 0.5,
      lineHeight: 24,
      fontSize: variables.fontSize4
    }
  };
};
