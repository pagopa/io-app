import { Platform, TouchableOpacityProperties } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface Button extends TouchableOpacityProperties, BsStyle {
      white?: boolean;
      whiteBordered?: boolean;
      cancel?: boolean;
      xsmall?: boolean;
      alert?: boolean;
      lightText?: boolean;
      unNamed?: boolean;
    }
  }
}

export default (): Theme => ({
  ".info": {
    backgroundColor: variables.colorHighlight,
    bordercolor: variables.colorHighlight
  },

  ".xsmall": {
    height: variables.btnXSmallHeight,
    "NativeBase.Text": {
      fontSize: variables.btnXSmallFontSize,
      lineHeight: variables.btnXSmallLineHeight
    },
    "NativeBase.Icon": {
      fontSize: variables.btnXSmallIconSize,
      paddingTop: 1,
      paddingRight: 4
    }
  },

  ".small": {
    height: variables.btnSmallHeight,
    ".lightText": {
      "NativeBase.Text": {
        ...makeFontStyleObject(Platform.select, variables.textLightButtonWeight)
      }
    },
    "NativeBase.Text": {
      fontSize: variables.btnSmallFontSize,
      lineHeight: variables.btnSmallLineHeight
    }
  },

  ".alert": {
    "NativeBase.Text": {
      color: IOColors.white
    },
    backgroundColor: variables.calendarExpirableColor
  },

  ".unNamed": {
    "NativeBase.Text": {
      color: variables.textMessageDetailLinkColor
    },
    backgroundColor: IOColors.greyLight
  },

  ".light": {
    ".bordered": {
      "NativeBase.Text": {
        color: variables.btnLightTextColor,
        fontWeight: variables.textBoldWeight
      },
      borderWidth: 1,
      borderColor: variables.btnLightBorderColor,
      backgroundColor: IOColors.white,
      ".primary": {
        "NativeBase.Text": { color: variables.brandPrimary },
        borderWidth: 1,
        borderColor: variables.brandPrimary,
        backgroundColor: IOColors.white
      }
    },
    "NativeBase.Text": {
      fontWeight: variables.textNormalWeight
    }
  },

  ".bordered": {
    ".disabled": {
      "NativeBase.Icon": {
        color: variables.btnDisabledBg
      },
      backgroundColor: IOColors.white
    },
    backgroundColor: IOColors.white
  },

  ".white": { backgroundColor: IOColors.white },

  ".whiteBordered": {
    backgroundColor: "transparent",
    borderColor: IOColors.white,
    borderWidth: 1,
    "NativeBase.Text": {
      color: IOColors.white
    }
  },

  ".cancel": {
    backgroundColor: IOColors.bluegrey,
    "NativeBase.Text": {
      color: IOColors.white
    }
  },

  "NativeBase.Text": {
    ...makeFontStyleObject(Platform.select, variables.btnTextFontWeight),
    fontSize: variables.btnFontSize,
    paddingLeft: 0,
    paddingRight: 0
  },

  justifyContent: "center",
  paddingHorizontal: 16,

  borderRadius: variables.btnBorderRadius,
  height: variables.btnHeight,
  elevation: 0,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 0,
  shadowOpacity: 0,
  alignSelf: "flex-start" // This attribute is necessary to solve the problem reported on Pivotal https://www.pivotaltracker.com/story/show/168290964/comments/207570370
});
