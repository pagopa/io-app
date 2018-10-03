import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "NativeBase.Left": {
    "NativeBase.Text": {
      alignSelf: "flex-start"
    },
    alignSelf: "center",
    flex: 1,
    flexDirection: "column"
  },
  "NativeBase.Right": {
    "UIComponent.IconFont": {
      color: variables.brandPrimary
    },
    alignSelf: "center",
    flex: 0,
    flexDirection: "column"
  }
});
