import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "NativeBase.Container": {
    "UIComponent.ScreenHeader": {
      "NativeBase.ViewNB": {
        backgroundColor: variables.contentBackground
      }
    },
    "NativeBase.ViewNB": {
      backgroundColor: variables.contentBackground,
      paddingLeft: variables.contentPadding,
      paddingRight: variables.contentPadding,
      paddingBottom: variables.spacerLargeHeight
    }
  }
});
