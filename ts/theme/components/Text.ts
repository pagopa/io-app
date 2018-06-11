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
      colorLabelTab?: boolean;
      alternativeBold?: boolean;
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
    ".formatDate": {
      fontWeight: "bold",
      fontSize: variables.fontSize2
    },
    ".leftAlign": {
      flex: variables.flexLeftAlign
    },
    ".colorLabelTab": {
      color: variables.brandPrimaryLight
    },
    ".rightAlign": {
      flex: variables.flexRightAlign
    },
    ".alternativeBold": {
      lineHeight: variables.lineHeight1,
      fontWeight: variables.textBoldWeight,
      color: variables.h1Color,
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    lineHeight: variables.lineHeightBase
  };
};
