import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h6FontWeight),
    color: variables.h6Color,
    fontSize: variables.h6FontSize,
    lineHeight: variables.h6LineHeight
  };
};
