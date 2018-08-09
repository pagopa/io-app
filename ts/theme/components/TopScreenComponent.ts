import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "UIComponent.BaseScreenComponent": {
    "NativeBase.Container": {
      "NativeBase.ViewNB": {
        backgroundColor: variables.contentBackground,
        paddingLeft: variables.contentPadding,
        paddingRight: variables.contentPadding,
        paddingBottom: variables.spacerLargeHeight
      }
    }
  }
});
