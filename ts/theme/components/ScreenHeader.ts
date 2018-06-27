import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "NativeBase.ViewNB": {
    "NativeBase.ViewNB": {
      // margin to align icon to the baseline of the title
      marginBottom: variables.h1FontSize / 3
    },
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  }
});
