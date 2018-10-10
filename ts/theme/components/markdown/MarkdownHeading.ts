import { Theme } from "../../types";
import variables from "../../variables";

export default (): Theme => {
  return {
    "NativeBase.H1": {},

    "NativeBase.H2": {},

    "NativeBase.H3": {},

    "NativeBase.H4": {},

    "NativeBase.H5": {},

    "NativeBase.H6": {},

    ".inMessage": {
      "NativeBase.H1": {
        fontSize: variables.fontSize6,
        lineHeight: 36,
        marginBottom: variables.fontSizeBase * 0.75,
        marginTop: variables.fontSizeBase * 2
      },

      "NativeBase.H2": {
        fontSize: variables.fontSize5,
        lineHeight: 32,
        marginBottom: variables.fontSizeBase * 0.5,
        marginTop: variables.fontSizeBase * 1.75
      },

      "NativeBase.H3": {
        fontSize: variables.fontSize4,
        lineHeight: 24,
        marginBottom: variables.fontSizeBase * 0.5,
        marginTop: variables.fontSizeBase * 1.5
      }
    }
  };
};
