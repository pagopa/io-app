import { Platform } from "react-native";

import { getStatusBarHeight } from "react-native-iphone-x-helper";
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
      "NativeBase.ViewNB": {
        padding: 0,
        paddingLeft: variables.iconSizeBase / 2,
        justifyContent: "center",
        width: (variables.iconSizeBase * 5) / 3,
        height: (variables.iconSizeBase * 5) / 3
      },
      padding: 0,
      minWidth: 40,
      flex: 0
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
      },
      "NativeBase.Item": {
        "NativeBase.Input": {
          height: 40
        },
        borderBottomWidth: 0,
        "NativeBase.Button": {
          minWidth: 40,
          alignSelf: "flex-start",
          justifyContent: "center",
          width: (variables.iconSizeBase * 5) / 3,
          height: (variables.iconSizeBase * 5) / 3,
          padding: variables.iconSizeBase / 4,
          "NativeBase.Icon": {
            marginHorizontal: 0
          }
        }
      },
      flex: 1,
      height: 40,
      justifyContent: "center"
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
      },
      flex: 0
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

    minHeight: variables.appHeaderHeight + getStatusBarHeight(true),
    borderBottomWidth: variables.headerBorderBottomWidth,
    paddingHorizontal: variables.appHeaderPaddingHorizontal,
    /* iOS */
    // shadowOpacity: 0,
    shadowOffset: {
      height: 0,
      width: 0
    },
    shadowRadius: 0,
    shadowColor: undefined,
    flexDirection: "row",
    /* Android */
    elevation: 0
  };
};
