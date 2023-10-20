import { Platform } from "react-native";

import { IOColors, IOVisualCostants } from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface Header {
      primary?: boolean;
      dark?: boolean;
    }
  }
}

export default (): Theme => ({
  "NativeBase.Left": {
    "NativeBase.Button": {
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
    justifyContent: "center"
  },

  "NativeBase.Right": {
    "NativeBase.Button": {
      ".transparent": {
        margin: 0,
        padding: variables.iconSizeBase / 4
      },
      width: (variables.iconSizeBase * 5) / 3,
      height: (variables.iconSizeBase * 5) / 3,
      padding: variables.iconSizeBase / 3,
      justifyContent: "center"
    },
    flex: 0,
    justifyContent: "center"
  },

  ".primary": {
    backgroundColor: variables.contentPrimaryBackground
  },

  ".dark": {
    backgroundColor: IOColors.bluegrey
  },

  ".noLeft": {
    "NativeBase.Body": {
      marginLeft: variables.appHeaderPaddingHorizontal,
      "NativeBase.Button": {
        marginLeft: -variables.appHeaderPaddingHorizontal
      }
    }
  },

  justifyContent: "center",
  height:
    Platform.OS === "ios"
      ? variables.appHeaderHeight + 18
      : variables.appHeaderHeight,
  borderBottomWidth: variables.headerBorderBottomWidth,
  paddingHorizontal: IOVisualCostants.appMarginDefault,
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
});
