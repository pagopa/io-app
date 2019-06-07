import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  ".expiring": {
    "NativeBase.Button": {
      "UIComponent.IconFont": {
        color: variables.colorWhite
      },

      "NativeBase.Text": {
        color: variables.colorWhite
      },

      backgroundColor: "#D0021B"
    }
  },

  ".expired": {
    "NativeBase.Button": {
      backgroundColor: variables.brandDarkGray
    }
  },

  ".disabled": {
    "NativeBase.Button": {
      "UIComponent.IconFont": {
        color: variables.brandLightGray
      },

      "NativeBase.Text": {
        color: variables.brandLightGray
      },

      borderColor: variables.brandLightGray
    }
  },

  "NativeBase.Button": {
    "UIComponent.IconFont": {
      color: variables.colorWhite
    },

    "NativeBase.Text": {
      marginLeft: 4,
      paddingRight: 0,
      paddingLeft: 0,
      lineHeight: 20,
      color: variables.colorWhite
    },

    flex: 1,
    backgroundColor: variables.brandPrimary
  }
});
