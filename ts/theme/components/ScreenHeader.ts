import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "NativeBase.ViewNB": {
    "NativeBase.H1": {
      marginLeft: variables.headerPaddingHorizontal
    },
    "NativeBase.ViewNB": {
      // margin to align icon to the baseline of the title
      marginBottom: 0,
      marginTop: variables.gridGutter,
      marginRight: variables.headerPaddingHorizontal
    },
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  }
});
