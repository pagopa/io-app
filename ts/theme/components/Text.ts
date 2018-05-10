import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TextProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Text extends TextProperties {
      link?: boolean;
      item?: boolean;
      bold?: boolean;
      dateFormat?: boolean;
      leftAlign?: boolean;
      rightAlign?: boolean;
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
      // lineHeight: variables.textBoldLineHeight,
      fontWeight: variables.textBoldWeight,
      color: variables.h1Color
    },
    ".dateFormat": {
      fontWeight: "bold",
      fontSize: variables.dateTextFontSize
    },
    ".leftAlign": {
      flex: variables.flexLeftAlign
    },
    ".rightAlign": {
      flex: variables.flexRightAlign
    },

    lineHeight: variables.lineHeight
  };
};
