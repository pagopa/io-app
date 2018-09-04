import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ListItem": {
      "NativeBase.ViewNB": {
        "NativeBase.Left": {
          "NativeBase.Text": {
            alignSelf: "flex-start"
          },
          alignSelf: "flex-start",
          flexDirection: "column",
          flex: 9
        },
        "NativeBase.Right": {
          "NativeBase.Text": {
            alignSelf: "flex-end",
            fontSize: variables.fontSize2,
            lineHeight: variables.lineHeight2
          },
          "NativeBase.Icon": {
            color: variables.brandPrimaryLight,
            alignSelf: "flex-end",
            height: variables.lineHeight2
          },
          flex: 3,
          flexDirection: "row",
          alignSelf: "flex-start"
        },
        "NativeBase.Text": {
          paddingRight: variables.gridGutter
        },
        flex: 1,
        flexDirection: "row",
        alignSelf: "flex-start"
      },
      "NativeBase.Button": {
        marginTop: variables.gridGutter,
        marginRight: variables.gridGutter * 2
      },
      flex: 1,
      flexDirection: "column",
      paddingLeft: variables.gridGutter,
      borderBottomColor: variables.brandLightGray,
      borderBottomWidth: 0.5
    }
  };
};
