import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  const theme = {
    ...makeFontStyleObject(Platform.select, variables.h1FontWeight),
    color: variables.h1Color
  };

  return theme;
};
