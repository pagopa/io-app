import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TextProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Text extends TextProperties {
      link?: boolean;
<<<<<<< HEAD
      bold?: boolean;
=======
      white?: boolean;
>>>>>>> Initial PIN login integration
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
    ".white": {
      color: variables.brandWhite
    },
    lineHeight: variables.lineHeight
  };
};
