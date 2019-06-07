import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  ".small": {
    "NativeBase.Button": {
      "UIComponent.IconFont": {
        lineHeight: 0,
        color: variables.brandPrimary
      },

      "NativeBase.Text": {
        lineHeight: 0,
        fontSize: 14
      },

      height: 32
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
      color: variables.brandPrimary
    },

    "NativeBase.Text": {
      marginLeft: 4,
      paddingRight: 0,
      paddingLeft: 0,
      color: variables.brandPrimary
    },

    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    borderWidth: 1,
    borderColor: variables.brandPrimary,
    backgroundColor: variables.colorWhite
  }
});
