import { Theme } from "../types";

export default (): Theme => ({
  // show inline buttons - 1/3 left, 2/3 right   -> [ b1 ] [   b2   ]
  ".inlineOneThird": {
    "NativeBase.ViewNB": {
      flexDirection: "row",
      "NativeBase.Button": {
        flex: 1,
        ".primary": {
          flex: 3,
          alignContent: "center"
        }
      }
    }
  },
  // show inline buttons -  1/2 left, 1/2 right -> [  b1  ] [  b2  ]
  ".inlineHalf": {
    "NativeBase.ViewNB": {
      flexDirection: "row",
      "NativeBase.Button": {
        flex: 1,
        alignContent: "center"
      }
    }
  }
});
