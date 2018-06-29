import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TextProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Text extends TextProperties {
      link?: boolean;
      bold?: boolean;
      formatDate?: boolean;
      leftAlign?: boolean;
      rightAlign?: boolean;
      alternativeBold?: boolean;
      white?: boolean;
      alignCenter?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".link": {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor
    },
    ".bold": {
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    ".leftAlign": {
      textAlign: "left"
    },
    ".rightAlign": {
      textAlign: "right"
    },
    ".alternativeBold": {
      lineHeight: variables.lineHeight2,
      fontWeight: variables.textBoldWeight,
      color: variables.h1Color,
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    ".white": {
      color: variables.colorWhite
    },
    ".alignCenter": {
      textAlign: "center"
    },
    lineHeight: variables.lineHeightBase
  };
};
