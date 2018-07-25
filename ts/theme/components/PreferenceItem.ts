import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  "NativeBase.ListItem": {
    "NativeBase.Left": {
      "NativeBase.Text": {
        alignSelf: "flex-start"
      },
      alignSelf: "center",
      flex: 1,
      flexDirection: "column"
    },
    "NativeBase.Right": {
      alignSelf: "center",
      color: variables.contentPrimaryBackground,
      flex: 0,
      flexDirection: "column"
    },
    borderBottomColor: variables.brandLightGray,
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: "row",
    marginLeft: 0,
    minHeight: 96
  }
});
