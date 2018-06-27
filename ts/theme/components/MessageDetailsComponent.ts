import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ViewNB": {
      "NativeBase.ViewNB": {
        "NativeBase.Text": {
          alignSelf: "flex-start"
        },

        "UIComponents.IconFont": {
          alignSelf: "flex-start",
          color: variables.brandPrimary,
          fontSize: variables.iconSizeBase,
          lineHeight: variables.lineHeight2
        },
        paddingTop: 20,
        flex: 1,
        flexDirection: "row",
        alignSelf: "flex-start"
      },

      "NativeBase.Text": {
        paddingTop: 20
      }
    }
  };
};
