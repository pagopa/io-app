import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

/**
 * @deprecated
 */
export default (): Theme => ({
    ...makeFontStyleObject(Platform.select, variables.labelNormalWeight)
  });
