import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h1FontWeight),
    color: variables.h1Color,
    fontSize: variables.h1FontSize,
    lineHeight: variables.h1LineHeight
  };
};
