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
        width: (variables.iconSizeBase * 5) / 3,
        height: (variables.iconSizeBase * 5) / 3
      },
      paddingLeft: 0,
      flex: 0,
      minWidth: 40
    },

    "NativeBase.Body": {
      "NativeBase.Text": {
        ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
        backgroundColor: "transparent",
        color: variables.toolbarTextColor,
        fontSize: variables.headerBodyFontSize
      },
      "NativeBase.Button": {
        minWidth: 40,
        alignSelf: "flex-start",
        justifyContent: "center",
        width: (variables.iconSizeBase * 5) / 3,
        height: (variables.iconSizeBase * 5) / 3
      }
    },

    "NativeBase.Right": {
      "NativeBase.Button": {
        minWidth: 40,
        ".transparent": {
          marginRight: 0,
          padding: variables.iconSizeBase / 4
        },
        width: (variables.iconSizeBase * 5) / 3,
        height: (variables.iconSizeBase * 5) / 3,
        padding: variables.iconSizeBase / 4
      }
    },

    ".primary": {
      backgroundColor: variables.contentPrimaryBackground,
      "NativeBase.Right": {
        "NativeBase.Button": {
          "UIComponent.IconFont": {
            color: variables.brandPrimaryInverted
          }
        }
      }
    },

    ".noLeft": {
      "NativeBase.Body": {
        marginLeft: variables.appHeaderPaddingHorizontal,
        "NativeBase.Button": {
          marginLeft: -variables.appHeaderPaddingHorizontal
        }
      }
    },

    borderBottomWidth: variables.headerBorderBottomWidth,
    elevation: 0,
    paddingHorizontal: variables.appHeaderPaddingHorizontal,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined
  };
};
