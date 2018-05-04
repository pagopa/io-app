import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h3FontWeight),
    color: variables.h3Color,
    // eslint-disable-next-line no-magic-numbers
    fontSize: variables.fontSizeBase * 1.25
  };
};
