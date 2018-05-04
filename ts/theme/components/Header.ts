import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.Left": {
      flex: 0.2
    },
    "NativeBase.Body": {
      "NativeBase.Text": {
        ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
        backgroundColor: "transparent",
        color: variables.toolbarTextColor,
        fontSize: variables.headerBodyFontSize
      }
    },

    borderBottomWidth: variables.headerBorderBottomWidth,
    elevation: 0,
    paddingHorizontal: variables.headerPaddingHorizontal,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined
  };
};
