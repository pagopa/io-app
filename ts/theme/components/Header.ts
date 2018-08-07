import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Header {
      primary?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    "NativeBase.Left": {
      "NativeBase.Button": {
        "UIComponent.IconFont": {
          color: variables.textColor
        },
        padding: 0,
        justifyContent: "center",
        width: variables.iconSizeBase * 2
      },
      paddingLeft: 0,
      marginLeft: -((variables.iconSizeBase * 3) / 4),
      flex: 0.17
    },

    "NativeBase.Body": {
      "NativeBase.Text": {
        ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
        backgroundColor: "transparent",
        color: variables.toolbarTextColor,
        fontSize: variables.headerBodyFontSize
      }
    },

    ".primary": {
      backgroundColor: variables.contentPrimaryBackground,
      "NativeBase.Right": {
        "UIComponent.IconFont": {
          color: variables.brandPrimaryInverted
        }
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
