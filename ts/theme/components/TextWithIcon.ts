import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ".danger": {
      "NativeBase.Text": {
        color: variables.brandDanger
      },

      "UIComponents.IconFont": {
        color: variables.brandDanger,
        fontSize: 20
      }
    },

    ".success": {
      "NativeBase.Text": {
        color: variables.brandSuccess
      },

      "UIComponents.IconFont": {
        color: variables.brandSuccess,
        fontSize: 20
      }
    },

    "NativeBase.Text": {
      paddingHorizontal: 5
    },

    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center"
  };
};
