import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ListItem": {
      "NativeBase.Right": {
        "NativeBase.Text": {
          alignSelf: "center"
        },
        "NativeBase.Icon": {
          alignSelf: "center",
          paddingTop: 10
        },
        flexDirection: "column",
        flex: 3,
        alignSelf: "flex-start"
      },
      "NativeBase.Left": {
        "NativeBase.Text": {
          alignSelf: "flex-start"
        },
        alignSelf: "flex-start",
        flexDirection: "column",
        flex: 9
      },
      marginLeft: 0,
      flexDirection: "row",
      flex: 1,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: 0.5
    }
  };
};
