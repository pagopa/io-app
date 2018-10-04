import { Platform, TextProperties } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface H1 extends TextProperties {
      inMessage?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ...makeFontStyleObject(Platform.select, variables.h1FontWeight),
    color: variables.h1Color,
    fontSize: variables.h1FontSize,
    lineHeight: variables.h1LineHeight,
    ".inMessage": {
      marginTop: variables.fontSizeBase * 2,
      marginBottom: variables.fontSizeBase * 0.75,
      lineHeight: 36,
      fontSize: variables.fontSize6
    }
  };
};
