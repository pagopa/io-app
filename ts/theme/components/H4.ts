import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h4FontWeight),
    color: variables.h4Color,
    fontSize: variables.h4FontSize,
    lineHeight: variables.h4LineHeight
  };
};
